import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { mobileCheckout, mapApiOrder, mobileInitiatePromptPay, mobileCheckPromptPay } from "@/services/api";
import { createOmiseToken } from "@/services/omise";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

type PaymentMethod = "card" | "qr";

export function PaymentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "Payment">>();
  const { shippingName, shippingPhone, shippingAddr } = route.params;

  const cart = useAppStore((state) => state.cart);
  const token = useAppStore((state) => state.token);
  const clearCart = useAppStore((state) => state.clearCart);
  const loadOrders = useAppStore((state) => state.loadOrders);
  const summary = getCartSummary(cart);

  const [method, setMethod] = useState<PaymentMethod>("card");

  // Card state
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardName, setCardName] = useState("TEST USER");
  const [expiry, setExpiry] = useState("12/27");
  const [cvv, setCvv] = useState("123");

  // QR state
  const [qrData, setQrData] = useState<{ chargeId: string; barcode: string; expiresAt: string } | null>(null);
  const [isCreatingQR, setIsCreatingQR] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{ title: string; message?: string } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling when QR is shown
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
            setModal({ title: "ชำระเงินไม่สำเร็จ", message: "QR Code หมดอายุหรือการชำระเงินไม่สำเร็จ กรุณาลองใหม่" });
          }
        } catch {
          // ignore transient poll errors
        }
      })();
    }, 3000);

    return clearPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData?.chargeId]);

  function clearPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
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

  async function handlePay() {
    const [expMonth, expYear] = expiry.split("/").map(Number);
    if (!cardNumber || !cardName || !expMonth || !expYear || !cvv) {
      setModal({ title: "กรุณากรอกข้อมูลให้ครบถ้วน", message: "กรุณากรอกหมายเลขบัตร ชื่อบนบัตร วันหมดอายุ และ CVV" });
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
        cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingName,
        shippingPhone,
        shippingAddr,
        omiseToken,
      );

      clearCart();
      await loadOrders();
      const mapped = mapApiOrder(order);
      setIsLoading(false);
      navigation.replace("OrderSuccess", { orderId: mapped.id });
    } catch (e) {
      setModal({ title: "ชำระเงินไม่สำเร็จ", message: e instanceof Error ? e.message : "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateQR() {
    if (!token) return;
    setIsCreatingQR(true);
    try {
      const result = await mobileInitiatePromptPay(
        token,
        cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingName,
        shippingPhone,
        shippingAddr,
      );
      setQrData(result);
    } catch (e) {
      setModal({ title: "สร้าง QR ไม่สำเร็จ", message: e instanceof Error ? e.message : "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setIsCreatingQR(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title="ชำระเงิน" />
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigateToHome(navigation) },
          { label: "Cart", onPress: () => navigation.navigate("Cart") },
          { label: "Checkout", onPress: () => navigation.navigate("Checkout") },
          { label: "ชำระเงิน" },
        ]}
      />

      {/* Payment method toggle */}
      <View style={styles.toggle}>
        <Pressable
          style={[styles.toggleBtn, method === "card" && styles.toggleBtnActive]}
          onPress={() => { setMethod("card"); setQrData(null); clearPolling(); }}
        >
          <Text style={[styles.toggleText, method === "card" && styles.toggleTextActive]}>บัตรเครดิต</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, method === "qr" && styles.toggleBtnActive]}
          onPress={() => setMethod("qr")}
        >
          <Text style={[styles.toggleText, method === "qr" && styles.toggleTextActive]}>PromptPay QR</Text>
        </Pressable>
      </View>

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
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
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
                onChangeText={(v) => setExpiry(formatExpiry(v))}
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
                onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.qrCard}>
          {qrData ? (
            <>
              <Text style={styles.sectionTitle}>สแกน QR เพื่อชำระเงิน</Text>
              <QRCode value={qrData.barcode} size={240} />
              <View style={styles.pollingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.pollingText}>รอการยืนยันชำระเงิน...</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>PromptPay QR</Text>
              <Text style={styles.qrHint}>กดปุ่มด้านล่างเพื่อสร้าง QR Code สำหรับสแกนจ่ายผ่านแอปธนาคาร</Text>
              <Pressable
                onPress={() => void handleCreateQR()}
                disabled={isCreatingQR}
                style={[styles.qrCreateBtn, isCreatingQR && styles.buttonDisabled]}
              >
                {isCreatingQR
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>สร้าง QR Code</Text>
                }
              </Pressable>
            </>
          )}
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>ยอดชำระทั้งหมด</Text>
        <Text style={styles.summaryAmount}>THB {summary.total.toFixed(0)}</Text>
      </View>

      {method === "card" && (
        <Pressable
          onPress={() => void handlePay()}
          disabled={isLoading}
          style={[styles.button, isLoading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>ชำระเงิน</Text>
        </Pressable>
      )}

      <AppModal
        visible={modal !== null}
        title={modal?.title ?? ""}
        message={modal?.message}
        onConfirm={() => setModal(null)}
      />

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
  content: { paddingBottom: spacing["3xl"] },
  toggle: {
    flexDirection: "row",
    marginHorizontal: spacing["2xl"],
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { color: colors.textSecondary, ...typography.body },
  toggleTextActive: { color: "#fff", fontWeight: "600" },
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
  sectionTitle: { color: colors.textPrimary, ...typography.title, alignSelf: "flex-start" },
  fieldGroup: { gap: spacing.xs, alignSelf: "stretch" },
  label: { color: colors.textSecondary, ...typography.caption },
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
  row: { flexDirection: "row", gap: spacing.md },
  qrHint: { color: colors.textSecondary, ...typography.body, textAlign: "center" },
  qrCreateBtn: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing["3xl"],
    alignItems: "center",
  },
  pollingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pollingText: { color: colors.textSecondary, ...typography.caption },
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
  summaryLabel: { color: colors.textSecondary, ...typography.body },
  summaryAmount: { color: colors.primaryStrong, ...typography.title },
  button: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: colors.textMuted },
  buttonText: { color: "#FFFFFF", ...typography.title },
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
  loadingText: { color: colors.textPrimary, ...typography.body },
});
