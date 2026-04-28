import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { navigateToHome } from "@/navigation/helpers";
import type { OrderStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

const STATUS_LABELS: Record<string, string> = {
  Pending: "รอดำเนินการ",
  Paid: "ชำระแล้ว",
  Processing: "กำลังเตรียม",
  Shipped: "จัดส่งแล้ว",
  Delivered: "ส่งสำเร็จ",
  Cancelled: "ยกเลิก",
};

const statusBg: Record<string, string> = {
  Pending: "#F5EEE5",
  Paid: "#EAF2E8",
  Processing: "#F5EEE5",
  Shipped: "#E5EEF5",
  Delivered: "#EAF2E8",
  Cancelled: "#F5E7EA",
};

export function OrderHistoryListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OrderStackParamList>>();
  const orders = useAppStore((state) => state.orders);

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="ประวัติคำสั่งซื้อ"
          subtitle="ดูรายการออเดอร์ย้อนหลังของคุณ"
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "ประวัติคำสั่งซื้อ" },
          ]}
        />
      }
    >
      <View style={styles.list}>
        {orders.map((order) => (
          <Pressable
            key={order.id}
            onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
            style={styles.card}
          >
            <View style={styles.row}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: statusBg[order.status] ?? "#F1F5F3" },
                ]}
              >
                <Text style={styles.status}>{STATUS_LABELS[order.status] ?? order.status}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {order.itemCount} รายการ · THB {order.total.toFixed(0)}
            </Text>
            <Text style={styles.date}>{order.placedAt}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
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
