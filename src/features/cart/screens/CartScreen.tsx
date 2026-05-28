import { CommonActions, useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToCategories, navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

function fmtBaht(n: number) {
  return `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const cart = useAppStore((state) => state.cart);
  const products = useAppStore((state) => state.products);
  const updateQuantity = useAppStore((state) => state.updateQuantity);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const pointTiers = useAppStore((state) => state.pointTiers);
  const summary = getCartSummary(cart);

  const nextTier = [...pointTiers]
    .sort((a, b) => a.minSpend - b.minSpend)
    .find((t) => summary.subtotal < t.minSpend);

  function handleCheckout() {
    if (!isAuthenticated) {
      navigation.dispatch(CommonActions.navigate({ name: "Profile" }));
      return;
    }
    navigation.navigate("Checkout");
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="ตะกร้าสินค้า"
          subtitle="ตรวจสอบรายการก่อนดำเนินการชำระเงิน"
          breadcrumbs={[
            { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
            { label: "ตะกร้าสินค้า" },
          ]}
          onBack={() => navigateToHome(navigation)}
        />
      }
    >
      <View style={styles.list}>
        {cart.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>ยังไม่มีสินค้าในตะกร้า</Text>
          </View>
        ) : (
          cart.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            if (!product) return null;

            return (
              <View key={item.productId} style={styles.itemCard}>
                <CommerceImage style={styles.swatch} uri={product.imageUrl} />
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{product.name}</Text>
                  <Text style={styles.itemPrice}>{fmtBaht(product.price)}</Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable onPress={() => updateQuantity(item.productId, item.quantity - 1)}>
                    <Text style={styles.stepperButton}>-</Text>
                  </Pressable>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <Pressable onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                    <Text style={styles.stepperButton}>+</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      {cart.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>สรุปรายการ</Text>
          <Row label="ยอดสินค้า" value={fmtBaht(summary.subtotal)} />
          <Row
            label="ค่าจัดส่ง"
            value={summary.shippingFee === 0 ? "ฟรี" : fmtBaht(summary.shippingFee)}
            free={summary.shippingFee === 0}
          />
          <Row label="ยอดรวม" strong value={fmtBaht(summary.total)} />
          {summary.pointsPreview > 0 ? (
            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>แต้มที่จะได้รับ</Text>
              <Text style={styles.pointsValue}>+{summary.pointsPreview} แต้ม</Text>
            </View>
          ) : null}
          {nextTier ? (
            <View style={styles.upsellRow}>
              <Text style={styles.upsellText}>
                ซื้ออีก ฿{(nextTier.minSpend - summary.subtotal).toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} รับ {nextTier.points} แต้ม
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <Pressable
        disabled={cart.length === 0}
        onPress={handleCheckout}
        style={[styles.button, cart.length === 0 && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>ดำเนินการชำระเงิน</Text>
      </Pressable>

      <Pressable onPress={() => navigateToCategories(navigation)} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>เลือกสินค้าต่อ</Text>
      </Pressable>
    </Screen>
  );
}

function Row({ label, value, strong = false, free = false }: { label: string; value: string; strong?: boolean; free?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strongText]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strongText, free && styles.freeText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  list: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
  },
  emptyCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
  },
  emptyText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  itemName: {
    color: colors.textPrimary,
    ...typography.body,
  },
  itemPrice: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stepperButton: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "600",
  },
  quantity: {
    color: colors.textPrimary,
    minWidth: 18,
    textAlign: "center",
    ...typography.caption,
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
  freeText: {
    color: "#2f7a4f",
    fontWeight: "700" as const,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  pointsLabel: {
    color: colors.primary,
    ...typography.caption,
  },
  pointsValue: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: "600",
  },
  upsellRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  upsellText: {
    color: "#C9952A",
    ...typography.caption,
    textAlign: "center",
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
  secondaryButton: {
    marginTop: spacing.md,
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primaryStrong,
    ...typography.title,
  },
});
