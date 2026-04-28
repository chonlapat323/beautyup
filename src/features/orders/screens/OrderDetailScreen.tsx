import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToHome, navigateToOrderHistory } from "@/navigation/helpers";
import { useAppStore } from "@/store/useAppStore";
import type { OrderStackParamList } from "@/navigation/types";
import { mobileGetOrderDocuments } from "@/services/api";
import { colors, radius, spacing, typography } from "@/theme";

const STATUS_LABELS: Record<string, string> = {
  Pending: "รอดำเนินการ",
  Paid: "ชำระแล้ว",
  Processing: "กำลังเตรียม",
  Shipped: "จัดส่งแล้ว",
  Delivered: "ส่งสำเร็จ",
  Cancelled: "ยกเลิก",
};

export function OrderDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OrderStackParamList>>();
  const route = useRoute<RouteProp<OrderStackParamList, "OrderDetail">>();
  const order = useAppStore((state) =>
    state.orders.find((entry) => entry.id === route.params.orderId),
  );
  const products = useAppStore((state) => state.products);
  const token = useAppStore((state) => state.token);

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  async function handleOpenDocument(type: "taxInvoice" | "receipt") {
    if (!token || !order) return;
    setIsLoading(true);
    try {
      const docs = await mobileGetOrderDocuments(token, order.id);
      const url = type === "taxInvoice" ? docs.taxInvoiceUrl : docs.receiptUrl;
      if (!url) {
        setErrorModal("ยังไม่มีเอกสารสำหรับคำสั่งซื้อนี้ กรุณาลองใหม่อีกครั้ง");
        return;
      }
      await Linking.openURL(url);
    } catch {
      setErrorModal("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  if (!order) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <AppHeader title="Order details" subtitle="ไม่พบรายการสั่งซื้อ" />
        <Breadcrumbs
          items={[
            { label: "Home", onPress: () => navigateToHome(navigation) },
            { label: "Orders", onPress: () => navigateToOrderHistory(navigation) },
            { label: "Order Detail" },
          ]}
        />
      </Screen>
    );
  }

  const subtotal = order.total - order.gatewayFee;

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title={order.id} subtitle={`Placed on ${order.placedAt}`} />
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigateToHome(navigation) },
          { label: "Orders", onPress: () => navigateToOrderHistory(navigation) },
          { label: order.id },
        ]}
      />

      <View style={styles.heroCard}>
        <View>
          <Text style={styles.heroLabel}>สถานะ</Text>
          <Text style={styles.heroValue}>{STATUS_LABELS[order.status] ?? order.status}</Text>
        </View>
        <View style={styles.heroDivider} />
        <View>
          <Text style={styles.heroLabel}>จำนวนสินค้า</Text>
          <Text style={styles.heroValue}>{order.itemCount}</Text>
        </View>
        {(order.pointEarned ?? 0) > 0 ? (
          <>
            <View style={styles.heroDivider} />
            <View>
              <Text style={styles.heroLabel}>แต้มที่ได้รับ</Text>
              <Text style={[styles.heroValue, styles.pointValue]}>+{order.pointEarned}</Text>
            </View>
          </>
        ) : null}
      </View>

      {(order.shippingName ?? order.shippingAddr) ? (
        <View style={styles.shippingCard}>
          <Text style={styles.sectionTitle}>ที่อยู่จัดส่ง</Text>
          {order.shippingName ? <Text style={styles.shippingText}>{order.shippingName}{order.shippingPhone ? ` · ${order.shippingPhone}` : ""}</Text> : null}
          {order.shippingAddr ? <Text style={styles.shippingAddr}>{order.shippingAddr}</Text> : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>รายการสินค้า</Text>
        {order.items.map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return (
            <View key={`${order.id}-${item.productId}`} style={styles.itemCard}>
              <CommerceImage style={styles.itemArtwork} uri={product?.imageUrl} />
              <View style={styles.itemCopy}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>จำนวน {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>THB {(item.price * item.quantity).toFixed(0)}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>สรุปยอดชำระ</Text>
        <Row label="ยอดสินค้า" value={`THB ${subtotal.toFixed(0)}`} />
        <Row label="ค่าธรรมเนียม" value={`THB ${order.gatewayFee.toFixed(0)}`} />
        <Row label="รวมทั้งหมด" strong value={`THB ${order.total.toFixed(0)}`} />
      </View>

      <View style={styles.docButtons}>
        <Pressable
          onPress={() => void handleOpenDocument("taxInvoice")}
          disabled={isLoading}
          style={[styles.docButton, isLoading && styles.docButtonDisabled]}
        >
          <Text style={styles.docButtonText}>ใบกำกับภาษี</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleOpenDocument("receipt")}
          disabled={isLoading}
          style={[styles.docButton, isLoading && styles.docButtonDisabled]}
        >
          <Text style={styles.docButtonText}>ใบเสร็จรับเงิน</Text>
        </Pressable>
      </View>

      <AppModal
        visible={errorModal !== null}
        title="ไม่พบเอกสาร"
        message={errorModal ?? undefined}
        onConfirm={() => setErrorModal(null)}
      />
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
  pointValue: {
    color: colors.primary,
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
  shippingCard: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  shippingText: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: "600",
  },
  shippingAddr: {
    color: colors.textSecondary,
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
  docButtons: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    flexDirection: "row",
    gap: spacing.md,
  },
  docButton: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  docButtonDisabled: { borderColor: colors.textMuted },
  docButtonText: {
    color: colors.primary,
    ...typography.title,
  },
});
