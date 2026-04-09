import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAppStore } from "@/store/useAppStore";
import type { OrderStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

const statusToneMap = {
  Paid: {
    backgroundColor: "#F5E7EA",
  },
  Preparing: {
    backgroundColor: "#F5EEE5",
  },
  Delivered: {
    backgroundColor: "#EAF2E8",
  },
} as const;

export function OrderHistoryListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OrderStackParamList>>();
  const orders = useAppStore((state) => state.orders);

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title="Order history" subtitle="Mock order updates for the presentation flow." />

      <View style={styles.list}>
        {orders.map((order) => (
          <Pressable
            key={order.id}
            onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
            style={styles.card}
          >
            <View style={styles.row}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View style={[styles.statusPill, statusToneMap[order.status]]}>
                <Text style={styles.status}>{order.status}</Text>
              </View>
            </View>
            <Text style={styles.meta}>{order.itemCount} items • THB {order.total.toFixed(0)}</Text>
            <Text style={styles.date}>{order.placedAt}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
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
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  orderId: {
    color: colors.textPrimary,
    ...typography.title,
  },
  meta: {
    color: colors.textSecondary,
    ...typography.body,
  },
  date: {
    color: colors.textMuted,
    ...typography.caption,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  status: {
    color: colors.primaryStrong,
    ...typography.caption,
  },
});
