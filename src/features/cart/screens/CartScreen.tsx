import { CommonActions, useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const cart = useAppStore((state) => state.cart);
  const products = useAppStore((state) => state.products);
  const updateQuantity = useAppStore((state) => state.updateQuantity);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const summary = getCartSummary(cart);

  function handleCheckout() {
    if (!isAuthenticated) {
      navigation.dispatch(CommonActions.navigate({ name: "Profile" }));
      return;
    }
    navigation.navigate("Checkout");
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title="Your cart" subtitle="ตรวจสอบสินค้าก่อนชำระเงิน" />
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigateToHome(navigation) },
          { label: "Cart" },
        ]}
      />

      <View style={styles.list}>
        {cart.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        ) : (
          cart.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            if (!product) return null;

            return (
              <View key={item.productId} style={styles.itemCard}>
                <CommerceImage style={styles.swatch} uri={product.imageUrl} />
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName}>{product.name}</Text>
                  <Text style={styles.itemPrice}>THB {product.price.toFixed(0)}</Text>
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

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order summary</Text>
        <Row label="Subtotal" value={`THB ${summary.subtotal.toFixed(0)}`} />
        <Row label="Gateway fee" value={`THB ${summary.gatewayFee.toFixed(0)}`} />
        <Row label="Total" strong value={`THB ${summary.total.toFixed(0)}`} />
        {summary.pointsPreview > 0 && (
          <View style={styles.pointsRow}>
            <Text style={styles.pointsLabel}>แต้มที่จะได้รับ</Text>
            <Text style={styles.pointsValue}>+{summary.pointsPreview} แต้ม</Text>
          </View>
        )}
      </View>

      <Pressable
        disabled={cart.length === 0}
        onPress={handleCheckout}
        style={[styles.button, cart.length === 0 && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Proceed to checkout</Text>
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
