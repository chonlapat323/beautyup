import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { mobileCheckout, mapApiOrder } from "@/services/api";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const cart = useAppStore((state) => state.cart);
  const token = useAppStore((state) => state.token);
  const clearCart = useAppStore((state) => state.clearCart);
  const summary = getCartSummary(cart);

  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddr, setShippingAddr] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    if (!shippingName || !shippingPhone || !shippingAddr) {
      Alert.alert("กรุณากรอกที่อยู่จัดส่งให้ครบ");
      return;
    }
    if (!token) return;
    setIsLoading(true);
    try {
      const order = await mobileCheckout(
        token,
        cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingName,
        shippingPhone,
        shippingAddr,
      );
      clearCart();
      const mapped = mapApiOrder(order);
      navigation.replace("OrderSuccess", { orderId: mapped.id });
    } catch (e) {
      Alert.alert("สั่งซื้อไม่สำเร็จ", e instanceof Error ? e.message : "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader
        title="Checkout"
        subtitle="กรอกข้อมูลการจัดส่งและยืนยันคำสั่งซื้อ"
      />
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigateToHome(navigation) },
          { label: "Cart", onPress: () => navigation.navigate("Cart") },
          { label: "Checkout" },
        ]}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ที่อยู่จัดส่ง</Text>
        <TextInput
          onChangeText={setShippingName}
          placeholder="ชื่อผู้รับ"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={shippingName}
        />
        <TextInput
          keyboardType="phone-pad"
          onChangeText={setShippingPhone}
          placeholder="เบอร์โทรศัพท์"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={shippingPhone}
        />
        <TextInput
          multiline
          numberOfLines={3}
          onChangeText={setShippingAddr}
          placeholder="ที่อยู่"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.textArea]}
          value={shippingAddr}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>สรุปยอดชำระ</Text>
        <Row label="ยอดรวม" value={`THB ${summary.subtotal.toFixed(0)}`} />
        <Row label="ค่าธรรมเนียม" value={`THB ${summary.gatewayFee.toFixed(0)}`} />
        <Row label="ยอดชำระทั้งหมด" value={`THB ${summary.total.toFixed(0)}`} strong />
      </View>

      <Pressable
        disabled={cart.length === 0 || isLoading}
        onPress={() => void handleConfirm()}
        style={[styles.button, (cart.length === 0 || isLoading) && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{isLoading ? "กำลังดำเนินการ..." : "ยืนยันการสั่งซื้อ"}</Text>
      </Pressable>
    </Screen>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strongText]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strongText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  card: {
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    ...typography.title,
  },
  input: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    ...typography.body,
  },
  textArea: {
    height: 88,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  summaryCard: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryTitle: {
    color: colors.textPrimary,
    ...typography.title,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: {
    color: colors.textSecondary,
    ...typography.body,
  },
  rowValue: {
    color: colors.textPrimary,
    ...typography.body,
  },
  strongText: {
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
});
