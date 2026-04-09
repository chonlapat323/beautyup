import { RouteProp, useRoute } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { ProductArtwork } from "@/components/ui/BeautyVisuals";
import { products } from "@/mock/catalog";
import { useAppStore } from "@/store/useAppStore";
import type { OrderStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function OrderDetailScreen() {
  const route = useRoute<RouteProp<OrderStackParamList, "OrderDetail">>();
  const order = useAppStore((state) =>
    state.orders.find((entry) => entry.id === route.params.orderId),
  );

  if (!order) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <AppHeader title="Order details" subtitle="We couldn't find this mock order." />
      </Screen>
    );
  }

  const subtotal = order.total - order.gatewayFee;

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title={order.id} subtitle={`Placed on ${order.placedAt}`} />

      <View style={styles.heroCard}>
        <View>
          <Text style={styles.heroLabel}>Status</Text>
          <Text style={styles.heroValue}>{order.status}</Text>
        </View>
        <View style={styles.heroDivider} />
        <View>
          <Text style={styles.heroLabel}>Items</Text>
          <Text style={styles.heroValue}>{order.itemCount}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items in this order</Text>
        {order.items.map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          if (!product) {
            return null;
          }

          return (
            <View key={`${order.id}-${item.productId}`} style={styles.itemCard}>
              <ProductArtwork product={product} style={styles.itemArtwork} />
              <View style={styles.itemCopy}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>Qty {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>THB {(item.price * item.quantity).toFixed(0)}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Payment summary</Text>
        <Row label="Subtotal" value={`THB ${subtotal.toFixed(0)}`} />
        <Row label="Gateway fee" value={`THB ${order.gatewayFee.toFixed(0)}`} />
        <Row label="Total" strong value={`THB ${order.total.toFixed(0)}`} />
      </View>
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
  heroCard: {
    marginHorizontal: spacing["2xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
  },
  heroLabel: {
    color: colors.textMuted,
    ...typography.caption,
  },
  heroValue: {
    color: colors.textPrimary,
    ...typography.title,
  },
  heroDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.borderSoft,
    marginHorizontal: spacing.xl,
  },
  section: {
    marginTop: spacing["2xl"],
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    ...typography.title,
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
  itemArtwork: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  itemName: {
    color: colors.textPrimary,
    ...typography.body,
  },
  itemMeta: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  itemPrice: {
    color: colors.primaryStrong,
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
});
