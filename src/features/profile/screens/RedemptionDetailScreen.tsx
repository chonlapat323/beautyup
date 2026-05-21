import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetMyRedemption } from "@/services/api";
import type { MyRedemptionDetail } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

type RedemptionStatus = MyRedemptionDetail["status"];

const STATUS_CONFIG: Record<RedemptionStatus, { label: string; bg: string; color: string }> = {
  PENDING:   { label: "รอดำเนินการ", bg: "#F3F4F6", color: "#6B7280" },
  PREPARING: { label: "กำลังเตรียมพัสดุ", bg: "#FEF3C7", color: "#D97706" },
  SHIPPED:   { label: "จัดส่งแล้ว", bg: "#DBEAFE", color: "#2563EB" },
  DELIVERED: { label: "ส่งถึงแล้ว", bg: "#D1FAE5", color: "#059669" },
};

export function RedemptionDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, "RedemptionDetail">>();
  const token = useAppStore((state) => state.token);
  const [detail, setDetail] = useState<MyRedemptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    mobileGetMyRedemption(token, route.params.redemptionId)
      .then(setDetail)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [token, route.params.redemptionId]);

  function formatDate(iso: string | null) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <Screen
      header={
        <AppHeader
          title="รายละเอียดของรางวัล"
          breadcrumbs={[
            { label: "บัญชีของฉัน", onPress: () => navigation.navigate("ProfileHome") },
            { label: "ของรางวัลของฉัน", onPress: () => navigation.goBack() },
            { label: "รายละเอียด" },
          ]}
        />
      }
    >
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : !detail ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>ไม่พบข้อมูล</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Product card */}
          <View style={styles.productCard}>
            <CommerceImage
              uri={detail.rewardProduct.imageUrl ?? undefined}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{detail.rewardProduct.name}</Text>
              <Text style={styles.points}>ใช้ {detail.pointsSpent.toLocaleString()} แต้ม</Text>
              <Text style={styles.date}>แลกเมื่อ {formatDate(detail.createdAt)}</Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สถานะ</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[detail.status].bg }]}>
              <Text style={[styles.statusText, { color: STATUS_CONFIG[detail.status].color }]}>
                {STATUS_CONFIG[detail.status].label}
              </Text>
            </View>
            {detail.statusUpdatedAt && (
              <Text style={styles.statusDate}>อัปเดตล่าสุด: {formatDate(detail.statusUpdatedAt)}</Text>
            )}
          </View>

          {/* Tracking */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>หมายเลขพัสดุ</Text>
            {detail.trackingNumber ? (
              <View style={styles.trackingBox}>
                <Text style={styles.trackingNumber}>{detail.trackingNumber}</Text>
              </View>
            ) : (
              <Text style={styles.noTracking}>ยังไม่มีหมายเลขพัสดุ</Text>
            )}
          </View>

          {/* Shipping address */}
          {detail.shippingRecipient && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ที่อยู่จัดส่ง</Text>
              <View style={styles.addressBox}>
                <Text style={styles.addressRecipient}>{detail.shippingRecipient}</Text>
                <Text style={styles.addressText}>{detail.shippingPhone}</Text>
                <Text style={styles.addressText}>{detail.shippingAddress}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing["3xl"] },
  empty: { marginTop: spacing["3xl"], alignItems: "center" },
  emptyText: { color: colors.textSecondary, ...typography.body },
  content: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
    gap: spacing["2xl"],
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    gap: spacing.md,
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.surfaceMuted,
  },
  productInfo: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    gap: spacing.xs,
  },
  productName: { color: colors.textPrimary, ...typography.body, fontWeight: "600" },
  points: { color: colors.primary, ...typography.caption, fontWeight: "600" },
  date: { color: colors.textMuted, ...typography.caption },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textSecondary, ...typography.caption, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  statusText: { fontSize: 14, fontWeight: "700" },
  statusDate: { color: colors.textMuted, ...typography.caption },
  trackingBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  trackingNumber: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", letterSpacing: 1 },
  noTracking: { color: colors.textMuted, ...typography.body },
  addressBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 4,
  },
  addressRecipient: { color: colors.textPrimary, ...typography.body, fontWeight: "600" },
  addressText: { color: colors.textSecondary, ...typography.caption },
});
