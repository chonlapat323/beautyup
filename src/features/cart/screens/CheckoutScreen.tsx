import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { mobileCheckout, mobileGetAddresses, mapApiOrder } from "@/services/api";
import type { MemberAddress } from "@/services/api";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const cart = useAppStore((state) => state.cart);
  const token = useAppStore((state) => state.token);
  const clearCart = useAppStore((state) => state.clearCart);
  const loadOrders = useAppStore((state) => state.loadOrders);
  const summary = getCartSummary(cart);

  const [addresses, setAddresses] = useState<MemberAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    mobileGetAddresses(token)
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setSelectedId(def.id);
      })
      .catch(() => {})
      .finally(() => setIsLoadingAddresses(false));
  }, [token]);

  const selected = addresses.find((a) => a.id === selectedId);

  async function handleConfirm() {
    if (!selected) {
      Alert.alert("กรุณาเลือกที่อยู่จัดส่ง");
      return;
    }
    if (!token) return;
    setIsLoading(true);
    try {
      const addrLines = [
        selected.addressLine1,
        selected.addressLine2,
        [selected.district, selected.province].filter(Boolean).join(" "),
        selected.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      const order = await mobileCheckout(
        token,
        cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        selected.recipient,
        selected.phone,
        addrLines,
      );
      clearCart();
      const mapped = mapApiOrder(order);
      await loadOrders();
      navigation.replace("OrderSuccess", { orderId: mapped.id });
    } catch (e) {
      Alert.alert("สั่งซื้อไม่สำเร็จ", e instanceof Error ? e.message : "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title="Checkout" subtitle="เลือกที่อยู่จัดส่งและยืนยันคำสั่งซื้อ" />
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigateToHome(navigation) },
          { label: "Cart", onPress: () => navigation.navigate("Cart") },
          { label: "Checkout" },
        ]}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ที่อยู่จัดส่ง</Text>

        {isLoadingAddresses ? (
          <Text style={styles.hint}>กำลังโหลดที่อยู่...</Text>
        ) : addresses.length === 0 ? (
          <View style={styles.noAddressBox}>
            <Text style={styles.noAddressText}>ยังไม่มีที่อยู่ที่บันทึกไว้</Text>
            <Text style={styles.hint}>กรุณาไปเพิ่มที่อยู่ในหน้า Profile ก่อนสั่งซื้อ</Text>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedId;
              const lines = [
                addr.addressLine1,
                addr.addressLine2,
                [addr.district, addr.province].filter(Boolean).join(" "),
                addr.postalCode,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <Pressable
                  key={addr.id}
                  style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                  onPress={() => setSelectedId(addr.id)}
                >
                  <View style={styles.radioRow}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.cardLabelRow}>
                        {addr.label ? <Text style={styles.addrLabel}>{addr.label}</Text> : null}
                        {addr.isDefault ? (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>หลัก</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.addrRecipient}>{addr.recipient} · {addr.phone}</Text>
                      <Text style={styles.addrLines}>{lines}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>สรุปยอดชำระ</Text>
        <Row label="ยอดรวม" value={`THB ${summary.subtotal.toFixed(0)}`} />
        <Row label="ค่าธรรมเนียม" value={`THB ${summary.gatewayFee.toFixed(0)}`} />
        <Row label="ยอดชำระทั้งหมด" value={`THB ${summary.total.toFixed(0)}`} strong />
      </View>

      <Pressable
        disabled={cart.length === 0 || isLoading || !selected}
        onPress={() => void handleConfirm()}
        style={[styles.button, (cart.length === 0 || isLoading || !selected) && styles.buttonDisabled]}
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
  content: { paddingBottom: spacing["3xl"] },
  section: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: { color: colors.textPrimary, ...typography.title },
  hint: { color: colors.textMuted, ...typography.caption },
  noAddressBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderStyle: "dashed",
    padding: spacing["2xl"],
    alignItems: "center",
    gap: spacing.xs,
  },
  noAddressText: { color: colors.textSecondary, ...typography.body },
  addressList: { gap: spacing.sm },
  addressCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  addressCardSelected: { borderColor: colors.primary, backgroundColor: "#f0faf4" },
  radioRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  cardLabelRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  addrLabel: { color: colors.primary, ...typography.caption, fontWeight: "700", textTransform: "uppercase" },
  defaultBadge: {
    backgroundColor: colors.primary,
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  defaultBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },
  addrRecipient: { color: colors.textPrimary, ...typography.caption, fontWeight: "600" },
  addrLines: { color: colors.textSecondary, ...typography.caption },
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
  summaryTitle: { color: colors.textPrimary, ...typography.title },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: colors.textSecondary, ...typography.body },
  rowValue: { color: colors.textPrimary, ...typography.body },
  strongText: { ...typography.title },
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
