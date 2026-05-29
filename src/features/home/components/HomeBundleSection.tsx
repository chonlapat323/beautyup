/**
 * HomeBundleSection — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • Section header: เพิ่ม gold bar ซ้าย (สอดคล้องกับ sections อื่น)
 * • Card: เพิ่มความสูงรูป 140→160px, corner radius ใหญ่ขึ้น (radius.lg)
 * • Item count: เปลี่ยนจาก muted text → gold pill badge
 * • Card border: เพิ่ม subtle gold border แทน borderSoft
 * • Description: แสดง bundle.description ถ้ามี (1 บรรทัด)
 * • Pressable: เพิ่ม android_ripple + opacity feedback
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, fonts, radius, spacing } from "@/theme";
import type { Bundle } from "@/types/domain";

type Props = {
  bundles: Bundle[];
  horizontalPadding: number;
  onViewAll?: () => void;
};

export function HomeBundleSection({ bundles, horizontalPadding, onViewAll }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();

  if (bundles.length === 0) return null;

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>

      {/* ✦ CHANGED: Section header — gold bar + layout สอดคล้องกับ sections อื่น */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.goldBar} />
          <View>
            <Text style={styles.sectionTitle}>สูตรพิเศษ</Text>
            <Text style={styles.sectionSub}>คลิกเพื่อดูสินค้าในสูตร</Text>
          </View>
        </View>
        {onViewAll ? (
          <Pressable hitSlop={8} onPress={onViewAll}>
            <Text style={styles.viewAll}>ดูทั้งหมด &gt;</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {bundles.map((bundle) => (
          <Pressable
            key={bundle.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            android_ripple={{ color: colors.goldSoft, borderless: false }}
            onPress={() =>
              navigation.navigate("ProductList", {
                bundleId: bundle.id,
                bundleName: bundle.name,
              })
            }
          >
            {/* ✦ CHANGED: รูปสูงขึ้น 160px */}
            <View style={styles.imageWrap}>
              <CommerceImage
                style={styles.cardImage}
                uri={bundle.imageUrl}
                contentFit="cover"
              />
              {/* ✦ NEW: Gold item count badge บนรูป */}
              <View style={styles.countBadge}>
                <MaterialIcons name="inventory-2" size={10} color={colors.goldDark} />
                <Text style={styles.countText}>{bundle.items.length} รายการ</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={2}>{bundle.name}</Text>
              {/* ✦ NEW: Description ถ้ามี */}
              {bundle.description ? (
                <Text style={styles.cardDesc} numberOfLines={1}>{bundle.description}</Text>
              ) : null}

              {/* ✦ NEW: ปุ่มดูสินค้า subtle */}
              <View style={styles.cta}>
                <Text style={styles.ctaText}>ดูสินค้า</Text>
                <MaterialIcons name="chevron-right" size={14} color={colors.goldDeep} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing["2xl"],
    marginBottom: spacing["2xl"],
  },
  header: {
    marginBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  viewAll: {
    fontSize: 13,
    color: colors.goldDeep,
    fontFamily: fonts.semiBold,
  },
  // ✦ NEW: Gold bar ซ้าย
  goldBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.bold,
    lineHeight: 22,
  },
  sectionSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontFamily: fonts.medium,
    marginTop: 3,
  },
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
    paddingRight: 4,
  },
  card: {
    width: 168,
    borderRadius: radius.lg,       // ✦ CHANGED: lg แทน md
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldMuted,  // ✦ CHANGED: subtle gold border
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.88,
  },
  imageWrap: {
    position: "relative",
  },
  cardImage: {
    width: 168,
    height: 160,                    // ✦ CHANGED: 120→160px
    backgroundColor: colors.surfaceMuted,
  },
  // ✦ NEW: Gold pill badge บนรูป
  countBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    color: colors.goldDark,
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    lineHeight: 18,
    minHeight: 36,
  },
  // ✦ NEW
  cardDesc: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.medium,
    lineHeight: 15,
  },
  // ✦ NEW: inline CTA
  cta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: {
    color: colors.goldDeep,
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
});
