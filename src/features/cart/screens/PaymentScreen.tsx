import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { mobileCheckout, mapApiOrder } from "@/services/api";
import { createOmiseToken } from "@/services/omise";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function PaymentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "Payment">>();
  const { shippingName, shippingPhone, shippingAddr } = route.params;

  const cart = useAppStore((state) => state.cart);
  const token = useAppStore((state) => state.token);
  const clearCart = useAppStore((state) => state.clearCart);
  const loadOrders = useAppStore((state) => state.loadOrders);
  const summary = getCartSummary(cart);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");   // MM/YY
  const [cvv, setCvv] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      Alert.alert("กรุณากรอกข้อมูลบัตรให้ครบถ้วน");
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
      navigation.replace("OrderSuccess", { orderId: mapped.id });
    } catch (e) {
      Alert.alert("ชำระเงินไม่สำเร็จ", e instanceof Error ? e.message : "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
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

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>ยอดชำระทั้งหมด</Text>
        <Text style={styles.summaryAmount}>THB {summary.total.toFixed(0)}</Text>
      </View>

      <Pressable
        onPress={() => void handlePay()}
        disabled={isLoading}
        style={[styles.button, isLoading && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{isLoading ? "กำลังชำระเงิน..." : "ชำระเงิน"}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing["3xl"] },
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
  sectionTitle: { color: colors.textPrimary, ...typography.title },
  fieldGroup: { gap: spacing.xs },
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
});
