/**
 * RewardsScreen — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • ไม่ใช้ AppHeader — minimal header
 * • ✦ Points balance card บนสุด — gold icon + ตัวเลขใหญ่ + sub label
 * • Reward card:
 *   - Points badge: green → gold (#D4AF37) + sparkle icon
 *   - ถ้าแต้มไม่พอ: badge มืด + ปุ่ม "แต้มไม่พอ" + lock icon
 *   - Stock: dot indicator (เขียว = พอ, ส้ม = เหลือน้อย)
 *   - ปุ่ม "แลกเลย": gold + gift icon
 * • Address bottom sheet: handle bar + radio selector + gold confirm button
 * • Confirm dialog: gift icon + gold button คู่ (ยกเลิก/ยืนยัน)
 */

import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppModal } from "@/components/ui/AppModal";
import { AddressPickerModal } from "@/components/ui/AddressPickerModal";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetRewardProducts, mobileRedeemReward } from "@/services/api";
import type { MemberAddress, RewardProduct } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

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
      .then(setRewards).catch(() => null).finally(() => setIsLoading(false));
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
      setRewards((prev) => prev.map((r) => r.id === item.id ? { ...r, stock: r.stock - 1 } : r));
      setModal({ type: "success", itemName: item.name });
    } catch (err) {
      setModal({ type: "error", message: err instanceof Error ? err.message : "แลกแต้มไม่สำเร็จ" });
    } finally {
      setRedeeming(null);
    }
  }

  const userPoints = member?.pointBalance ?? 0;

  return (
    <Screen contentContainerStyle={styles.content}>

      {/* ✦ Minimal header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>แลกแต้ม</Text>
          <Text style={styles.pageSubtitle}>ใช้แต้มสะสมแลกของรางวัล</Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back-ios" size={12} color={colors.goldDeep} />
          <Text style={styles.backText}>ย้อนกลับ</Text>
        </Pressable>
      </View>

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        {[
          { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
          { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
          { label: "แลกแต้ม" },
        ].map((item, i, arr) => (
          <View key={i} style={styles.bcItem}>
            {item.onPress
              ? <Text style={styles.bcLink} onPress={item.onPress}>{item.label}</Text>
              : <Text style={styles.bcCur}>{item.label}</Text>
            }
            {i < arr.length - 1 && <Text style={styles.bcSep}>/</Text>}
          </View>
        ))}
      </View>

      {/* ✦ Points balance card */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsIcon}>
          <MaterialIcons name="auto-awesome" size={20} color={colors.gold} />
        </View>
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsLabel}>แต้มสะสมของคุณ</Text>
          <Text style={styles.pointsNum}>{userPoints.toLocaleString("th-TH")}</Text>
          <Text style={styles.pointsSub}>แต้มพร้อมใช้งาน</Text>
        </View>
      </View>

      {/* Modals */}
      <AddressPickerModal
        visible={addressModalVisible}
        onClose={() => { setAddressModalVisible(false); setPendingItem(null); }}
        onSelect={handleAddressSelected}
        onAddAddress={() => navigation.navigate("Addresses")}
      />
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
        title="แลกแต้มสำเร็จ!"
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
        message={modal?.type === "insufficient"
          ? `คุณมี ${modal.points.toLocaleString()} แต้ม\nแต่ต้องใช้ ${modal.cost.toLocaleString()} แต้ม`
          : ""}
        confirmLabel="ตกลง"
        onConfirm={() => setModal(null)}
      />

      {/* ✦ Reward grid */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.gold} />
      ) : rewards.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="card-giftcard" size={36} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>ยังไม่มีสินค้าแลกแต้ม</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>ของรางวัลที่แลกได้</Text>
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {rewards.map((item) => {
              const canRedeem = userPoints >= item.pointCost && item.stock > 0;
              const isRedeeming = redeeming === item.id;
              const outOfStock = item.stock === 0;
              const isLowStock = item.stock > 0 && item.stock <= 10;

              return (
                <View key={item.id} style={[styles.card, outOfStock && styles.cardDimmed]}>
                  {/* Image */}
                  <View style={styles.imageWrap}>
                    <CommerceImage uri={item.imageUrl ?? undefined} thumbnailUri={item.thumbnailUrl ?? undefined} style={styles.image} contentFit="cover" />

                    {/* ✦ Points badge */}
                    <View style={[styles.pointsBadge, !canRedeem && styles.pointsBadgeDim]}>
                      <MaterialIcons name="auto-awesome" size={10} color={canRedeem ? colors.goldDark : "rgba(255,255,255,0.8)"} />
                      <Text style={[styles.pointsBadgeText, !canRedeem && styles.pointsBadgeTextDim]}>
                        {item.pointCost.toLocaleString()} แต้ม
                      </Text>
                    </View>

                    {/* Out of stock */}
                    {outOfStock && (
                      <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>หมด</Text>
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                    {item.description ? (
                      <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
                    ) : null}

                    {/* ✦ Stock indicator */}
                    {!outOfStock && (
                      <View style={styles.stockRow}>
                        <View style={[styles.stockDot, isLowStock && styles.stockDotLow]} />
                        <Text style={styles.stockText}>
                          {isLowStock ? `เหลือเพียง ${item.stock} ชิ้น` : `เหลือ ${item.stock} ชิ้น`}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* ✦ Redeem button */}
                  <Pressable
                    style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                    disabled={!canRedeem || isRedeeming}
                    onPress={() => handleRedeem(item)}
                  >
                    <MaterialIcons
                      name={outOfStock ? "remove-shopping-cart" : !canRedeem ? "lock" : "card-giftcard"}
                      size={13}
                      color={canRedeem ? colors.goldDark : colors.textMuted}
                    />
                    <Text style={[styles.redeemText, !canRedeem && styles.redeemTextDisabled]}>
                      {isRedeeming ? "กำลังแลก..." : outOfStock ? "สินค้าหมด" : !canRedeem ? "แต้มไม่พอ" : "แลกเลย"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing["3xl"], backgroundColor: colors.background },

  // Header
  pageHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 16, paddingBottom: 6 },
  pageTitle: { color: "#fff", fontSize: 24, fontFamily: fonts.extraBold },
  pageSubtitle: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: fonts.medium, marginTop: 2 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingTop: 6 },
  backText: { color: colors.goldDeep, fontSize: 12, fontFamily: fonts.semiBold },
  breadcrumb: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", paddingHorizontal: 18, paddingBottom: 14, gap: 4 },
  bcItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  bcLink: { color: colors.gold, fontSize: 10, fontFamily: fonts.semiBold },
  bcSep: { color: "rgba(255,255,255,0.3)", fontSize: 10 },
  bcCur: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: fonts.medium },

  // ✦ Points balance card
  pointsCard: {
    marginHorizontal: 16, marginBottom: 18,
    backgroundColor: colors.surface, borderRadius: 18,
    borderWidth: 1, borderColor: colors.goldMuted,
    padding: 14, flexDirection: "row", alignItems: "center", gap: 14,
  },
  pointsIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.goldSoft, borderWidth: 1.5, borderColor: colors.gold,
    alignItems: "center", justifyContent: "center",
  },
  pointsInfo: { flex: 1 },
  pointsLabel: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.bold, letterSpacing: 0.8, textTransform: "uppercase" },
  pointsNum: { color: colors.goldDeep, fontSize: 24, fontFamily: fonts.extraBold, lineHeight: 28 },
  pointsSub: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.medium, marginTop: 1 },

  loader: { marginTop: 40 },
  empty: { marginTop: 40, alignItems: "center", gap: 10 },
  emptyText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: fonts.medium },

  sectionLabel: { color: "rgba(255,255,255,0.5)", fontSize: 8, fontFamily: fonts.bold, letterSpacing: 1, textTransform: "uppercase", paddingHorizontal: 18, marginBottom: 12 },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16, paddingBottom: spacing["3xl"] },

  // Reward card
  card: { width: "47.5%", backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, overflow: "hidden" },
  cardDimmed: { opacity: 0.6 },
  imageWrap: { position: "relative", aspectRatio: 1, backgroundColor: colors.surfaceMuted },
  image: { width: "100%", height: "100%" },

  // ✦ Points badge
  pointsBadge: {
    position: "absolute", bottom: 7, left: 7,
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: colors.gold, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  pointsBadgeDim: { backgroundColor: "rgba(0,0,0,0.5)" },
  pointsBadgeText: { color: colors.goldDark, fontSize: 9, fontFamily: fonts.bold },
  pointsBadgeTextDim: { color: "rgba(255,255,255,0.9)" },

  outOfStockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.42)", alignItems: "center", justifyContent: "center" },
  outOfStockText: { color: "#fff", fontSize: 14, fontFamily: fonts.bold },

  cardBody: { padding: 10, gap: 4 },
  cardName: { color: colors.textPrimary, fontSize: 12, fontFamily: fonts.bold, lineHeight: 17, minHeight: 34 },
  cardDesc: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.medium },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  stockDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ade80" },
  stockDotLow: { backgroundColor: "#f97316" },
  stockText: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.medium },

  // ✦ Redeem button
  redeemBtn: {
    marginHorizontal: 9, marginBottom: 9,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    borderRadius: radius.pill, backgroundColor: colors.gold,
    paddingVertical: 9,
    shadowColor: colors.gold, shadowOpacity: 0.28, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  redeemBtnDisabled: { backgroundColor: colors.surfaceMuted, shadowOpacity: 0 },
  redeemText: { color: colors.goldDark, fontSize: 11, fontFamily: fonts.bold },
  redeemTextDisabled: { color: colors.textMuted },
});
