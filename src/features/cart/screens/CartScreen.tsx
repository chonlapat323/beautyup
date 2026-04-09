import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { ProductArtwork } from "@/components/ui/BeautyVisuals";
import { products } from "@/mock/catalog";
import type { ShopStackParamList } from "@/navigation/types";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const cart = useAppStore((state) => state.cart);
  const updateQuantity = useAppStore((state) => state.updateQuantity);
  const summary = getCartSummary(cart);

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title="Your cart" subtitle="Review your mock basket before checkout." />

      <View style={styles.list}>
        {cart.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        ) : (
          cart.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            if (!product) {
              return null;
            }

            return (
              <View key={item.productId} style={styles.itemCard}>
                <ProductArtwork product={product} style={styles.swatch} />
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
      </View>

      <Pressable
        disabled={cart.length === 0}
        onPress={() => navigation.navigate("Checkout")}
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
