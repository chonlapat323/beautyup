import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Image, Linking, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SvgXml } from "react-native-svg";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppModal } from "@/components/ui/AppModal";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { mobileCheckKBankPayment, mobileCheckPromptPay, mobileCheckout, mobileInitiateKBankCardPayment, mobileInitiateKBankPayment, mobileInitiateKBankQRPayment, mobileInitiatePromptPay, mapApiOrder } from "@/services/api";
import { createOmiseToken } from "@/services/omise";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

type PaymentMethod = "card" | "qr" | "kplus" | "kcard" | "kqr";

export function PaymentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "Payment">>();
  const { shippingName, shippingPhone, shippingAddr } = route.params;

  const cart = useAppStore((state) => state.cart);
  const token = useAppStore((state) => state.token);
  const clearCart = useAppStore((state) => state.clearCart);
  const loadOrders = useAppStore((state) => state.loadOrders);
  const refreshProfile = useAppStore((state) => state.refreshProfile);
  const summary = getCartSummary(cart);
  const creditAmount = route.params.creditAmount ?? 0;
  const chargeAmount = Math.max(0, summary.total - creditAmount);
  const isCreditOnly = chargeAmount === 0;

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardName, setCardName] = useState("TEST USER");
  const [expiry, setExpiry] = useState("12/27");
  const [cvv, setCvv] = useState("123");
  const [qrData, setQrData] = useState<{
    chargeId: string;
    svgContent: string;
    expiresAt: string;
  } | null>(null);
  const [isCreatingQR, setIsCreatingQR] = useState(false);
  const [isKBankLoading, setIsKBankLoading] = useState(false);
  const [kbankPaymentID, setKbankPaymentID] = useState<string | null>(null);
  const [kbankQRData, setKbankQRData] = useState<{ qrImage: string; partnerPaymentID: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{ title: string; message?: string } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kbankPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kbankQRPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isCreditOnly || method !== "qr" || qrData || isCreatingQR) return;
    void handleCreateQR();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, isCreditOnly]);

  useEffect(() => {
    if (!qrData || !token) return;

    pollingRef.current = setInterval(() => {
      void (async () => {
        try {
          const result = await mobileCheckPromptPay(token, qrData.chargeId);
          if (result.status === "successful" && result.order) {
            clearPolling();
            clearCart();
            await loadOrders();
            const mapped = mapApiOrder(result.order);
            navigation.replace("OrderSuccess", { orderId: mapped.id });
          } else if (result.status === "failed" || result.status === "expired") {
            clearPolling();
            setQrData(null);
            setModal({
              title: "ชำระเงินไม่สำเร็จ",
              message: "QR Code หมดอายุหรือการชำระเงินไม่สำเร็จ กรุณาลองใหม่",
            });
          }
        } catch {
          // Ignore transient poll errors.
        }
      })();
    }, 3000);

    return clearPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData?.chargeId]);

  useEffect(() => {
    if (!kbankPaymentID || !token) return;

    kbankPollingRef.current = setInterval(() => {
      void (async () => {
        try {
          const result = await mobileCheckKBankPayment(token, kbankPaymentID);
          if (result.status === "successful" && result.order) {
            clearKBankPolling();
            clearCart();
            await loadOrders();
            const mapped = mapApiOrder(result.order);
            navigation.replace("OrderSuccess", { orderId: mapped.id });
          } else if (["failed", "expired", "cancelled"].includes(result.status)) {
            clearKBankPolling();
            setKbankPaymentID(null);
            setModal({ title: "ชำระเงินไม่สำเร็จ", message: "การชำระเงิน K+ ไม่สำเร็จ กรุณาลองใหม่" });
          }
        } catch {
          // Ignore transient poll errors.
        }
      })();
    }, 3000);

    return clearKBankPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kbankPaymentID]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && kbankPaymentID && !kbankPollingRef.current && token) {
        kbankPollingRef.current = setInterval(() => {
          void (async () => {
            try {
              const result = await mobileCheckKBankPayment(token, kbankPaymentID);
              if (result.status === "successful" && result.order) {
                clearKBankPolling();
                clearCart();
                await loadOrders();
                const mapped = mapApiOrder(result.order);
                navigation.replace("OrderSuccess", { orderId: mapped.id });
              } else if (["failed", "expired", "cancelled"].includes(result.status)) {
                clearKBankPolling();
                setKbankPaymentID(null);
                setModal({ title: "ชำระเงินไม่สำเร็จ", message: "การชำระเงิน K+ ไม่สำเร็จ กรุณาลองใหม่" });
              }
            } catch {
              // Ignore transient poll errors.
            }
          })();
        }, 3000);
      }
    });
    return () => sub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kbankPaymentID, token]);

  function clearPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  useEffect(() => {
    if (!kbankQRData || !token) return;
    const { partnerPaymentID } = kbankQRData;
    kbankQRPollingRef.current = setInterval(() => {
      void (async () => {
        try {
          const result = await mobileCheckKBankPayment(token, partnerPaymentID);
          if (result.status === "successful" && result.order) {
            clearKBankQRPolling();
            clearCart();
            await loadOrders();
            const mapped = mapApiOrder(result.order);
            navigation.replace("OrderSuccess", { orderId: mapped.id });
          } else if (["failed", "expired", "cancelled"].includes(result.status)) {
            clearKBankQRPolling();
            setKbankQRData(null);
            setModal({ title: "ชำระเงินไม่สำเร็จ", message: "การชำระเงิน KBank QR ไม่สำเร็จ กรุณาลองใหม่" });
          }
        } catch {
          // Ignore transient poll errors.
        }
      })();
    }, 3000);
    return clearKBankQRPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kbankQRData?.partnerPaymentID]);

  function clearKBankPolling() {
    if (kbankPollingRef.current) {
      clearInterval(kbankPollingRef.current);
      kbankPollingRef.current = null;
    }
  }

  function clearKBankQRPolling() {
    if (kbankQRPollingRef.current) {
      clearInterval(kbankQRPollingRef.current);
      kbankQRPollingRef.current = null;
    }
  }

  function handleMethodChange(newMethod: PaymentMethod) {
    setMethod(newMethod);
    setQrData(null);
    clearPolling();
    clearKBankPolling();
    clearKBankQRPolling();
    setKbankPaymentID(null);
    setKbankQRData(null);
  }

  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handleCreditOnlyPay() {
    if (!token) return;
    setIsLoading(true);
    try {
      const order = await mobileCheckout(
        token,
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName,
        shippingPhone,
        shippingAddr,
        undefined,
        creditAmount,
      );
      clearCart();
      await Promise.all([loadOrders(), refreshProfile()]);
      const mapped = mapApiOrder(order);
      navigation.replace("OrderSuccess", { orderId: mapped.id });
    } catch (error) {
      setModal({ title: "ชำระเงินไม่สำเร็จ", message: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePay() {
    const [expMonth, expYear] = expiry.split("/").map(Number);
    if (!cardNumber || !cardName || !expMonth || !expYear || !cvv) {
      setModal({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        message: "กรุณากรอกหมายเลขบัตร ชื่อบนบัตร วันหมดอายุ และ CVV",
      });
      return;
    }
    if (!token) return;

    setIsLoading(true);
    try {
      const omiseToken = await createOmiseToken({
        number: cardNumber,
        name: cardName,
        expirationMonth: expMonth,
        expirationYear: 2000 + expYear,
        securityCode: cvv,
      });

      const order = await mobileCheckout(
        token,
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName,
        shippingPhone,
        shippingAddr,
        omiseToken,
        creditAmount > 0 ? creditAmount : undefined,
      );

      clearCart();
      await Promise.all([loadOrders(), refreshProfile()]);
      const mapped = mapApiOrder(order);
      navigation.replace("OrderSuccess", { orderId: mapped.id });
    } catch (error) {
      setModal({
        title: "ชำระเงินไม่สำเร็จ",
        message: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleKBankPay() {
    if (!token) return;
    setIsKBankLoading(true);
    try {
      const result = await mobileInitiateKBankPayment(
        token,
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName,
        shippingPhone,
        shippingAddr,
        creditAmount > 0 ? creditAmount : undefined,
      );
      if (result.deepLink) {
        setKbankPaymentID(result.partnerPaymentID);
        await Linking.openURL(result.deepLink);
      } else {
        setModal({ title: "ไม่พบ deepLink", message: "KBank ไม่ส่ง deepLink กลับมา กรุณาลองใหม่" });
      }
    } catch (error) {
      setModal({
        title: "ชำระเงินผ่าน K+ ไม่สำเร็จ",
        message: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsKBankLoading(false);
    }
  }

  async function handleKBankCardPay() {
    if (!token) return;
    setIsKBankLoading(true);
    try {
      const result = await mobileInitiateKBankCardPayment(
        token,
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName,
        shippingPhone,
        shippingAddr,
        creditAmount > 0 ? creditAmount : undefined,
      );
      if (result.redirectURL) {
        setKbankPaymentID(result.partnerPaymentID);
        await Linking.openURL(result.redirectURL);
      } else {
        setModal({ title: "ไม่พบ URL ชำระเงิน", message: "KBank ไม่ส่ง redirectURL กลับมา กรุณาลองใหม่" });
      }
    } catch (error) {
      setModal({
        title: "ชำระเงินผ่าน KBank Card ไม่สำเร็จ",
        message: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsKBankLoading(false);
    }
  }

  async function handleKBankQRPay() {
    if (!token) return;
    setIsKBankLoading(true);
    try {
      const result = await mobileInitiateKBankQRPayment(
        token,
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName, shippingPhone, shippingAddr,
        creditAmount > 0 ? creditAmount : undefined,
      );
      setKbankQRData(result);
    } catch (error) {
      setModal({ title: "สร้าง KBank QR ไม่สำเร็จ", message: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setIsKBankLoading(false);
    }
  }

  async function handleCreateQR() {
    if (!token) return;
    setIsCreatingQR(true);
    try {
      const result = await mobileInitiatePromptPay(
        token,
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName,
        shippingPhone,
        shippingAddr,
        creditAmount > 0 ? creditAmount : undefined,
      );
      setQrData(result);
    } catch (error) {
      setModal({
        title: "สร้าง QR ไม่สำเร็จ",
        message: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsCreatingQR(false);
    }
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="ชำระเงิน"
          subtitle="เลือกวิธีชำระเงินและยืนยันการสั่งซื้อ"
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "ตะกร้าสินค้า", onPress: () => navigation.navigate("Cart") },
            { label: "ตรวจสอบคำสั่งซื้อ", onPress: () => navigation.navigate("Checkout") },
            { label: "ชำระเงิน" },
          ]}
        />
      }
    >
      {creditAmount > 0 && (
        <View style={styles.creditSummaryBox}>
          <Text style={styles.creditSummaryText}>
            ใช้ Credit ฿{creditAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            {isCreditOnly ? " (ครอบคลุมทั้งหมด)" : ` — ชำระเพิ่มอีก ฿${chargeAmount.toFixed(0)}`}
          </Text>
        </View>
      )}

      {!isCreditOnly && (
        <View style={styles.methodList}>
          {([
            { key: "card",  label: "บัตรเครดิต / เดบิต" },
            { key: "qr",    label: "PromptPay QR" },
            { key: "kplus", label: "KBank K+" },
            { key: "kcard", label: "KBank บัตรเครดิต" },
            { key: "kqr",   label: "KBank QR" },
          ] as { key: PaymentMethod; label: string }[]).map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.methodBtn, method === key && styles.methodBtnActive]}
              onPress={() => handleMethodChange(key)}
            >
              <Text style={[styles.methodBtnText, method === key && styles.methodBtnTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {method === "card" ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ข้อมูลบัตรเครดิต / เดบิต</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>หมายเลขบัตร</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={(value) => setCardNumber(formatCardNumber(value))}
              maxLength={19}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>ชื่อบนบัตร</Text>
            <TextInput
              style={styles.input}
              placeholder="FIRST LAST"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              value={cardName}
              onChangeText={setCardName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>วันหมดอายุ</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={expiry}
                onChangeText={(value) => setExpiry(formatExpiry(value))}
                maxLength={5}
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={(value) => setCvv(value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.qrCard}>
          {isCreatingQR ? (
            <>
              <Text style={styles.sectionTitle}>PromptPay QR</Text>
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginVertical: spacing["2xl"] }}
              />
              <Text style={styles.qrHint}>กำลังสร้าง QR Code...</Text>
            </>
          ) : qrData ? (
            <>
              <Text style={styles.sectionTitle}>สแกน QR เพื่อชำระเงิน</Text>
              {qrData.svgContent ? (
                <SvgXml xml={qrData.svgContent} width={240} height={240} />
              ) : (
                <Text style={styles.qrHint}>ไม่สามารถโหลด QR Code ได้ กรุณาลองใหม่</Text>
              )}
              <View style={styles.pollingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.pollingText}>รอการยืนยันชำระเงิน...</Text>
              </View>
            </>
          ) : null}
        </View>
      )}

      {method === "kplus" && (
        <View style={styles.qrCard}>
          <Text style={styles.sectionTitle}>ชำระเงินผ่าน K+</Text>
          {kbankPaymentID ? (
            <View style={styles.pollingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.pollingText}>รอการยืนยันจาก K+...</Text>
            </View>
          ) : (
            <Text style={styles.qrHint}>กดปุ่มด้านล่างเพื่อเปิดแอป K+ และยืนยันการชำระเงิน</Text>
          )}
        </View>
      )}

      {method === "kcard" && (
        <View style={styles.qrCard}>
          <Text style={styles.sectionTitle}>ชำระเงินด้วยบัตร KBank</Text>
          {kbankPaymentID ? (
            <View style={styles.pollingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.pollingText}>รอการยืนยัน 3D Secure...</Text>
            </View>
          ) : (
            <Text style={styles.qrHint}>กดปุ่มด้านล่างเพื่อชำระเงินผ่านระบบ 3D Secure ของ KBank</Text>
          )}
        </View>
      )}

      {method === "kqr" && (
        <View style={styles.qrCard}>
          <Text style={styles.sectionTitle}>KBank QR Payment</Text>
          {isKBankLoading ? (
            <>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing["2xl"] }} />
              <Text style={styles.qrHint}>กำลังสร้าง QR Code...</Text>
            </>
          ) : kbankQRData ? (
            <>
              {kbankQRData.qrImage ? (
                <Image
                  source={{ uri: kbankQRData.qrImage.startsWith("http") ? kbankQRData.qrImage : `data:image/png;base64,${kbankQRData.qrImage}` }}
                  style={{ width: 240, height: 240 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.qrHint}>ไม่สามารถโหลด QR Code ได้</Text>
              )}
              <View style={styles.pollingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.pollingText}>รอการสแกน QR...</Text>
              </View>
            </>
          ) : (
            <Text style={styles.qrHint}>กดปุ่มด้านล่างเพื่อสร้าง QR Code ชำระเงิน</Text>
          )}
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>ยอดชำระทั้งหมด</Text>
        <Text style={styles.summaryAmount}>THB {chargeAmount.toFixed(0)}</Text>
      </View>

      {isCreditOnly ? (
        <Pressable
          onPress={() => void handleCreditOnlyPay()}
          disabled={isLoading}
          style={[styles.button, isLoading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>จ่ายด้วย Credit</Text>
        </Pressable>
      ) : method === "card" ? (
        <Pressable
          onPress={() => void handlePay()}
          disabled={isLoading}
          style={[styles.button, isLoading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>ชำระเงิน</Text>
        </Pressable>
      ) : method === "kplus" ? (
        <Pressable
          onPress={() => void handleKBankPay()}
          disabled={isKBankLoading || kbankPaymentID !== null}
          style={[styles.button, (isKBankLoading || kbankPaymentID !== null) && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{isKBankLoading ? "กำลังเปิด K+..." : kbankPaymentID ? "รอการยืนยัน..." : "ชำระเงินด้วย K+"}</Text>
        </Pressable>
      ) : method === "kcard" ? (
        <Pressable
          onPress={() => void handleKBankCardPay()}
          disabled={isKBankLoading || kbankPaymentID !== null}
          style={[styles.button, (isKBankLoading || kbankPaymentID !== null) && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{isKBankLoading ? "กำลังเปิด..." : kbankPaymentID ? "รอการยืนยัน..." : "ชำระเงินด้วย KBank Card"}</Text>
        </Pressable>
      ) : method === "kqr" && !kbankQRData ? (
        <Pressable
          onPress={() => void handleKBankQRPay()}
          disabled={isKBankLoading}
          style={[styles.button, isKBankLoading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{isKBankLoading ? "กำลังสร้าง QR..." : "สร้าง QR ชำระเงิน"}</Text>
        </Pressable>
      ) : null}

      <AppModal
        visible={modal !== null}
        title={modal?.title ?? ""}
        message={modal?.message}
        onConfirm={() => setModal(null)}
      />

      <Modal visible={isKBankLoading || kbankPaymentID !== null} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{isKBankLoading ? "กำลังเปิด K+..." : "รอการยืนยันจาก K+..."}</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={isLoading} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>กำลังชำระเงิน...</Text>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  methodList: {
    marginHorizontal: spacing["2xl"],
    gap: spacing.sm,
  },
  methodBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  methodBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodBtnText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  methodBtnTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  card: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.lg,
  },
  qrCard: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.lg,
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.textPrimary,
    ...typography.title,
    alignSelf: "flex-start",
  },
  fieldGroup: {
    gap: spacing.xs,
    alignSelf: "stretch",
  },
  label: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    ...typography.body,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  qrHint: {
    color: colors.textSecondary,
    ...typography.body,
    textAlign: "center",
  },
  pollingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pollingText: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  summaryCard: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["2xl"],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
  },
  summaryLabel: {
    color: colors.textSecondary,
    ...typography.body,
  },
  summaryAmount: {
    color: colors.primaryStrong,
    ...typography.title,
  },
  button: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing["3xl"],
    paddingHorizontal: spacing["3xl"],
    alignItems: "center",
    gap: spacing.lg,
  },
  loadingText: {
    color: colors.textPrimary,
    ...typography.body,
  },
  creditSummaryBox: {
    marginHorizontal: spacing["2xl"],
    marginBottom: spacing.lg,
    backgroundColor: "#F0FAF4",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#B7DDC7",
    padding: spacing.md,
  },
  creditSummaryText: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: "600",
    textAlign: "center",
  },
});
