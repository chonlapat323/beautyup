import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { navigateToHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetRewardProducts, mobileRedeemReward } from "@/services/api";
import type { RewardProduct } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function RewardsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((state) => state.token);
  const member = useAppStore((state) => state.member);
  const updateMemberPoints = useAppStore((state) => state.updateMemberPoints);

  const [rewards, setRewards] = useState<RewardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    mobileGetRewardProducts(token)
      .then(setRewards)
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleRedeem(item: RewardProduct) {
    if (!token) return;
    const points = member?.pointBalance ?? 0;
    if (points < item.pointCost) {
      Alert.alert("แต้มไม่เพียงพอ", `คุณมี ${points} แต้ม แต่ต้องใช้ ${item.pointCost} แต้ม`);
      return;
    }
    Alert.alert(
      "ยืนยันการแลก",
      `แลก "${item.name}" ด้วย ${item.pointCost.toLocaleString()} แต้ม?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยัน",
          onPress: async () => {
            setRedeeming(item.id);
            try {
              await mobileRedeemReward(token, item.id);
              updateMemberPoints(-item.pointCost);
              Alert.alert("สำเร็จ", `แลก "${item.name}" เรียบร้อยแล้ว`);
              setRewards((prev) =>
                prev.map((r) => (r.id === item.id ? { ...r, stock: r.stock - 1 } : r)),
              );
            } catch (err) {
              Alert.alert("ผิดพลาด", err instanceof Error ? err.message : "แลกแต้มไม่สำเร็จ");
            } finally {
              setRedeeming(null);
            }
          },
        },
      ],
    );
  }

  return (
    <Screen
      header={
        <AppHeader
          title="แลกแต้ม"
          subtitle="ใช้แต้มสะสมแลกของรางวัล"
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
            { label: "แลกแต้ม" },
          ]}
        />
      }
    >
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : rewards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>ยังไม่มีสินค้าแลกแต้ม</Text>
        </View>
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const canRedeem = (member?.pointBalance ?? 0) >= item.pointCost && item.stock > 0;
            const isRedeeming = redeeming === item.id;
            return (
              <View style={styles.card}>
                <View style={styles.cardBody}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  ) : null}
                  <View style={styles.metaRow}>
                    <Text style={styles.cost}>{item.pointCost.toLocaleString()} แต้ม</Text>
                    <Text style={[styles.stock, item.stock === 0 && styles.stockOut]}>
                      {item.stock > 0 ? `เหลือ ${item.stock}` : "หมด"}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                  disabled={!canRedeem || isRedeeming}
                  onPress={() => handleRedeem(item)}
                >
                  <Text style={[styles.redeemText, !canRedeem && styles.redeemTextDisabled]}>
                    {isRedeeming ? "กำลังแลก..." : "แลก"}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing["3xl"],
  },
  empty: {
    marginTop: spacing["3xl"],
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  list: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  itemName: {
    color: colors.textPrimary,
    ...typography.title,
    fontSize: 15,
  },
  itemDesc: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: 2,
  },
  cost: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  stock: {
    color: colors.textMuted,
    fontSize: 12,
  },
  stockOut: {
    color: "#e53e3e",
  },
  redeemBtn: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  redeemBtnDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  redeemText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  redeemTextDisabled: {
    color: colors.textMuted,
  },
});
