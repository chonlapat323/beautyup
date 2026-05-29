import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetMyRedemptions } from "@/services/api";
import type { MyRedemption } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

type RedemptionStatus = MyRedemption["status"];

const STATUS_CONFIG: Record<RedemptionStatus, { label: string; bg: string; color: string }> = {
  PENDING:   { label: "รอดำเนินการ", bg: "#F3F4F6", color: "#6B7280" },
  PREPARING: { label: "กำลังเตรียม", bg: "#FEF3C7", color: "#D97706" },
  SHIPPED:   { label: "จัดส่งแล้ว",  bg: "#DBEAFE", color: "#2563EB" },
  DELIVERED: { label: "ส่งถึงแล้ว",  bg: "#D1FAE5", color: "#059669" },
};

function StatusBadge({ status }: { status: RedemptionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

export function MyRedemptionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((state) => state.token);
  const [redemptions, setRedemptions] = useState<MyRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    mobileGetMyRedemptions(token)
      .then(setRedemptions)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [token]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric",
    });
  }

  return (
    <Screen
      scrollable={false}
    >
      <AppHeader
        title="ของรางวัลของฉัน"
        subtitle="ติดตามสถานะของรางวัลที่แลก"
        onBack={() => navigation.goBack()}
        breadcrumbs={[
          { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
          { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
          { label: "ของรางวัล" },
        ]}
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : redemptions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>ยังไม่มีการแลกของรางวัล</Text>
          <Pressable onPress={() => navigation.navigate("Rewards")} style={styles.goRedeemBtn}>
            <Text style={styles.goRedeemText}>ดูของรางวัล</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={redemptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate("RedemptionDetail", { redemptionId: item.id })}
            >
              <CommerceImage
                uri={item.rewardProduct.imageUrl ?? undefined}
                style={styles.image}
              />
              <View style={styles.cardContent}>
                <Text style={styles.productName} numberOfLines={2}>{item.rewardProduct.name}</Text>
                <Text style={styles.points}>ใช้ {item.pointsSpent.toLocaleString()} แต้ม</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                <StatusBadge status={item.status} />
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing["3xl"] },
  empty: {
    marginTop: spacing["3xl"],
    alignItems: "center",
    gap: spacing.lg,
  },
  emptyText: { color: "rgba(255,255,255,0.7)", ...typography.body },
  goRedeemBtn: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["2xl"],
  },
  goRedeemText: { color: "#FFFFFF", ...typography.body, fontWeight: "600" },
  list: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
    gap: spacing.md,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    gap: spacing.md,
  },
  image: {
    width: 88,
    height: 88,
    backgroundColor: colors.surfaceMuted,
  },
  cardContent: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    gap: 4,
  },
  productName: { color: colors.textPrimary, ...typography.body, fontWeight: "600" },
  points: { color: colors.primary, ...typography.caption, fontWeight: "600" },
  date: { color: colors.textMuted, ...typography.caption },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
});
