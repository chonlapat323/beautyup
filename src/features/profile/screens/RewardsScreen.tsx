import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppModal } from "@/components/ui/AppModal";
import { AddressPickerModal } from "@/components/ui/AddressPickerModal";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetRewardProducts, mobileRedeemReward } from "@/services/api";
import type { MemberAddress, RewardProduct } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

type ModalState =
  | { type: "confirm"; item: RewardProduct }
  | { type: "success"; itemName: string }
  | { type: "error"; message: string }
  | { type: "insufficient"; points: number; cost: number }
  | null;

export function RewardsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((state) => state.token);
  const member = useAppStore((state) => state.member);
  const refreshProfile = useAppStore((state) => state.refreshProfile);

  const [rewards, setRewards] = useState<RewardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState<RewardProduct | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<MemberAddress | null>(null);

  useEffect(() => {
    if (!token) return;
    mobileGetRewardProducts(token)
      .then(setRewards)
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [token]);

  function handleRedeem(item: RewardProduct) {
    const points = member?.pointBalance ?? 0;
    if (points < item.pointCost) {
      setModal({ type: "insufficient", points, cost: item.pointCost });
      return;
    }
    setPendingItem(item);
    setAddressModalVisible(true);
  }

  function handleAddressSelected(address: MemberAddress) {
    setSelectedAddress(address);
    setAddressModalVisible(false);
    if (pendingItem) setModal({ type: "confirm", item: pendingItem });
  }

  async function confirmRedeem(item: RewardProduct) {
    if (!token || !selectedAddress) return;
    setModal(null);
    setRedeeming(item.id);
    try {
      await mobileRedeemReward(token, item.id, selectedAddress.id);
      await refreshProfile();
      setRewards((prev) => prev.map((r) => (r.id === item.id ? { ...r, stock: r.stock - 1 } : r)));
      setModal({ type: "success", itemName: item.name });
    } catch (err) {
      setModal({ type: "error", message: err instanceof Error ? err.message : "แลกแต้มไม่สำเร็จ" });
    } finally {
      setRedeeming(null);
    }
  }

  const userPoints = member?.pointBalance ?? 0;

  return (
    <Screen
    >
      <AppHeader
        title="แลกแต้ม"
        subtitle="ใช้แต้มสะสมแลกของรางวัล"
        onBack={() => navigation.goBack()}
        breadcrumbs={[
          { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
          { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
          { label: "แลกแต้ม" },
        ]}
      />
      {/* Address Picker */}
      <AddressPickerModal
        visible={addressModalVisible}
        onClose={() => { setAddressModalVisible(false); setPendingItem(null); }}
        onSelect={handleAddressSelected}
        onAddAddress={() => navigation.navigate("Addresses")}
      />

      {/* Modals */}
      <AppModal
        visible={modal?.type === "confirm"}
        type="confirm"
        title="ยืนยันการแลก"
        message={modal?.type === "confirm" ? `แลก "${modal.item.name}"\nด้วย ${modal.item.pointCost.toLocaleString()} แต้ม?` : ""}
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        onConfirm={() => modal?.type === "confirm" && void confirmRedeem(modal.item)}
        onCancel={() => setModal(null)}
      />
      <AppModal
        visible={modal?.type === "success"}
        type="success"
        title="แลกแต้มสำเร็จ"
        message={modal?.type === "success" ? `"${modal.itemName}" พร้อมจัดส่งให้คุณแล้ว` : ""}
        confirmLabel="ตกลง"
        onConfirm={() => setModal(null)}
      />
      <AppModal
        visible={modal?.type === "error"}
        type="error"
        title="เกิดข้อผิดพลาด"
        message={modal?.type === "error" ? modal.message : ""}
        confirmLabel="ตกลง"
        onConfirm={() => setModal(null)}
      />
      <AppModal
        visible={modal?.type === "insufficient"}
        type="error"
        title="แต้มไม่เพียงพอ"
        message={modal?.type === "insufficient" ? `คุณมี ${modal.points.toLocaleString()} แต้ม\nแต่ต้องใช้ ${modal.cost.toLocaleString()} แต้ม` : ""}
        confirmLabel="ตกลง"
        onConfirm={() => setModal(null)}
      />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : rewards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>ยังไม่มีสินค้าแลกแต้ม</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {rewards.map((item) => {
            const canRedeem = userPoints >= item.pointCost && item.stock > 0;
            const isRedeeming = redeeming === item.id;
            const outOfStock = item.stock === 0;
            return (
              <View key={item.id} style={[styles.card, outOfStock && styles.cardDisabled]}>
                {/* รูปสินค้า */}
                <View style={styles.imageWrap}>
                  <CommerceImage
                    uri={item.imageUrl ?? undefined}
                    style={styles.image}
                  />
                  {/* badge แต้ม */}
                  <View style={styles.pointBadge}>
                    <Text style={styles.pointBadgeText}>{item.pointCost.toLocaleString()} แต้ม</Text>
                  </View>
                  {/* badge หมด */}
                  {outOfStock ? (
                    <View style={styles.outOfStockOverlay}>
                      <Text style={styles.outOfStockText}>หมด</Text>
                    </View>
                  ) : null}
                </View>

                {/* ข้อมูล */}
                <View style={styles.info}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  {!outOfStock ? (
                    <Text style={styles.stockText}>เหลือ {item.stock} ชิ้น</Text>
                  ) : null}
                </View>

                {/* ปุ่มแลก */}
                <Pressable
                  style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                  disabled={!canRedeem || isRedeeming}
                  onPress={() => handleRedeem(item)}
                >
                  <Text style={[styles.redeemText, !canRedeem && styles.redeemTextDisabled]}>
                    {isRedeeming ? "กำลังแลก..." : outOfStock ? "สินค้าหมด" : "แลกเลย"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
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
    color: "rgba(255,255,255,0.65)",
    ...typography.body,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  card: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    gap: spacing.sm,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
  },
  pointBadge: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pointBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  info: {
    paddingHorizontal: spacing.md,
    gap: 3,
  },
  itemName: {
    color: colors.textPrimary,
    ...typography.body,
    fontSize: 13,
    fontWeight: "600",
  },
  itemDesc: {
    color: colors.textSecondary,
    ...typography.caption,
    fontSize: 11,
  },
  stockText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  redeemBtn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  redeemBtnDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  redeemText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  redeemTextDisabled: {
    color: colors.textMuted,
  },
});
