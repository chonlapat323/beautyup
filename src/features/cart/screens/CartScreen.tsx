/**
 * CartScreen — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • ลบ AppHeader ออก (ไม่มี avatar / ชื่อ / greeting / points)
 * • ใช้ minimal page header แทน — title ใหญ่ + ปุ่มย้อนกลับ (ตรงขวา)
 * • Background: jade green (#046340) ต่อเนื่องจากหน้าแรก
 * • Item card: gold border subtle, stepper เป็น gold circle buttons
 * • ราคาสินค้า: goldDeep แทน textSecondary
 * • Primary CTA: Gold button (#D4AF37) + dark text — premium feel
 * • Secondary CTA: white bg + primary green border
 * • Summary card: gold สำหรับ total + upsell text
 * • Points earned row: gold pill badge
 * • Upsell row: gold sparkle icon + gold text
 */

import { CommonActions, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToCategories, navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

function fmtBaht(n: number) {
  return `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const cart = useAppStore((state) => state.cart);
  const products = useAppStore((state) => state.products);
  const updateQuantity = useAppStore((state) => state.updateQuantity);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const pointTiers = useAppStore((state) => state.pointTiers);
  const summary = getCartSummary(cart);

  const nextTier = [...pointTiers]
    .sort((a, b) => a.minSpend - b.minSpend)
    .find((t) => summary.subtotal < t.minSpend);

  function handleCheckout() {
    if (!isAuthenticated) {
      navigation.dispatch(CommonActions.navigate({ name: "Profile" }));
      return;
    }
    navigation.navigate("Checkout");
  }

  return (
    // ✦ CHANGED: ไม่มี header prop → ไม่มี AppHeader เลย
    <Screen contentContainerStyle={styles.content}>

      {/* ✦ NEW: Minimal page title — ไม่มี avatar/name/points */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>ตะกร้าสินค้า</Text>
          <Text style={styles.pageSubtitle}>ตรวจสอบรายการก่อนดำเนินการชำระเงิน</Text>
        </View>
        <Pressable onPress={() => navigateToHome(navigation)} style={styles.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back-ios" size={12} color={colors.goldDeep} />
          <Text style={styles.backText}>ย้อนกลับ</Text>
        </Pressable>
      </View>

      {/* Cart Items */}
      <View style={styles.list}>
        {cart.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="shopping-cart" size={32} color={colors.sage} />
            <Text style={styles.emptyTitle}>ยังไม่มีสินค้าในตะกร้า</Text>
            <Text style={styles.emptyBody}>เลือกสินค้าที่ชอบแล้วกด "ใส่ตะกร้า"</Text>
          </View>
        ) : (
          cart.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;

            return (
              <View key={item.productId} style={styles.itemCard}>
                {/* Product image */}
                <View style={styles.swatchWrap}>
                  <CommerceImage style={styles.swatch} uri={product.imageUrl} thumbnailUri={product.thumbnailUrl} contentFit="cover" />
                </View>

                {/* Name + Price */}
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
                    {product.name}
                  </Text>
                  {/* ✦ CHANGED: goldDeep แทน textSecondary */}
                  <Text style={styles.itemPrice}>{fmtBaht(product.price)}</Text>
                </View>

                {/* ✦ CHANGED: Gold circle stepper */}
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                    style={styles.stepBtn}
                    hitSlop={6}
                  >
                    <MaterialIcons name="remove" size={14} color={colors.goldDark} />
                  </Pressable>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                    style={styles.stepBtn}
                    hitSlop={6}
                  >
                    <MaterialIcons name="add" size={14} color={colors.goldDark} />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Summary Card */}
      {cart.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>สรุปรายการ</Text>

          <View style={styles.divider} />

          <SummaryRow label="ยอดสินค้า" value={fmtBaht(summary.subtotal)} />
          <SummaryRow
            label="ค่าจัดส่ง"
            value={summary.shippingFee === 0 ? "ฟรี" : fmtBaht(summary.shippingFee)}
            free={summary.shippingFee === 0}
          />

          <View style={styles.divider} />

          {/* ✦ CHANGED: Total ใช้ goldDeep + font ใหญ่ */}
          <SummaryRow label="ยอดรวม" value={fmtBaht(summary.total)} strong />

          {/* Points earned */}
          {summary.pointsPreview > 0 && (
            <View style={styles.pointsRow}>
              <MaterialIcons name="auto-awesome" size={13} color={colors.gold} />
              <Text style={styles.pointsText}>
                คำสั่งซื้อนี้ได้รับ {summary.pointsPreview} แต้ม
              </Text>
            </View>
          )}

          {/* ✦ Upsell nudge */}
          {nextTier && (
            <View style={styles.upsellRow}>
              <MaterialIcons name="local-offer" size={13} color={colors.gold} />
              <Text style={styles.upsellText}>
                ซื้ออีก ฿{(nextTier.minSpend - summary.subtotal).toLocaleString("th-TH", { minimumFractionDigits: 0 })} รับเพิ่ม {nextTier.points} แต้ม
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ✦ CHANGED: Gold primary CTA */}
      <Pressable
        disabled={cart.length === 0}
        onPress={handleCheckout}
        style={[styles.primaryBtn, cart.length === 0 && styles.primaryBtnDisabled]}
      >
        <Text style={[styles.primaryBtnText, cart.length === 0 && styles.primaryBtnTextDisabled]}>
          ดำเนินการชำระเงิน
        </Text>
      </Pressable>

      {/* Secondary CTA */}
      <Pressable onPress={() => navigateToCategories(navigation)} style={styles.secondaryBtn}>
        <Text style={styles.secondaryBtnText}>เลือกสินค้าต่อ</Text>
      </Pressable>

    </Screen>
  );
}

function SummaryRow({
  label, value, strong = false, free = false,
}: {
  label: string; value: string; strong?: boolean; free?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.rowLabel, strong && styles.rowLabelStrong]}>{label}</Text>
      <Text style={[
        styles.rowValue,
        strong && styles.rowValueStrong,
        free && styles.rowValueFree,
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
    backgroundColor: colors.background,  // jade green full screen
  },

  // ✦ NEW: Minimal page header
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: fonts.extraBold,
    lineHeight: 34,
  },
  pageSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontFamily: fonts.medium,
    marginTop: 3,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingTop: 6,
  },
  backText: {
    color: colors.goldDeep,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },

  // Cart items
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },

  // Empty state
  emptyCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.medium,
    textAlign: "center",
  },

  // Item card
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldMuted,   // ✦ subtle gold border
    padding: 12,
  },
  swatchWrap: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  swatch: {
    width: 62,
    height: 62,
  },
  itemCopy: {
    flex: 1,
    gap: 5,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    lineHeight: 19,
  },
  // ✦ CHANGED: goldDeep
  itemPrice: {
    color: colors.goldDeep,
    fontSize: 14,
    fontFamily: fonts.bold,
  },

  // ✦ CHANGED: Gold circle stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: "center",
    fontSize: 15,
    fontFamily: fonts.bold,
  },

  // Summary card
  summaryCard: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    padding: 16,
    gap: 10,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.goldMuted,
    marginVertical: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  rowLabelStrong: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  rowValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  // ✦ CHANGED: gold total
  rowValueStrong: {
    color: colors.goldDeep,
    fontFamily: fonts.extraBold,
    fontSize: 18,
  },
  rowValueFree: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },

  // Points & Upsell
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.goldSoft,
    borderRadius: 10,
    padding: 8,
  },
  pointsText: {
    color: colors.goldDeep,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  upsellRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.goldSoft,
    borderRadius: 10,
    padding: 8,
  },
  upsellText: {
    color: colors.goldDeep,
    fontSize: 12,
    fontFamily: fonts.semiBold,
    flex: 1,
  },

  // ✦ CHANGED: Gold primary CTA
  primaryBtn: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryBtnDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
  },
  primaryBtnText: {
    color: colors.goldDark,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  primaryBtnTextDisabled: {
    color: "#fff",
  },

  // Secondary CTA
  secondaryBtn: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
});
