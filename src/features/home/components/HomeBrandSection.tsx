/**
 * HomeBrandSection — v3 Design Proposal
 *
 * แนวคิด: รักษา white card container เหมือน HomeCategoriesSection
 * แต่ upgrade ภายในให้เข้าธีม jade × gold
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • White card container + border #8EB397 (เหมือน categories)
 * • Glow blobs: เพิ่ม gold glow (top-right) + green glow (bottom-left)
 * • Circle: เปลี่ยนจาก plain → gold ring (border: 2px solid gold)
 * • Gold dot badge บน circle top-right (star icon)
 * • Brand sub text: collections/lines ใต้ชื่อแบรนด์
 * • ปุ่ม "ช้อป": เปลี่ยนจาก primaryDark (green) → gold (#D4AF37) + icon ถุง
 * • Bottom notch: คงเดิม (เหมือน categories)
 * • Horizontal scroll เมื่อมี > 3 แบรนด์
 */

import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";


type Props = {
  horizontalPadding: number;
  onSelectBrand: (brandId: string, brandName: string) => void;
  onViewAll?: () => void;
};

export function HomeBrandSection({ horizontalPadding, onSelectBrand, onViewAll }: Props) {
  const brands = useAppStore((state) => state.brands);
  const products = useAppStore((state) => state.products);

  if (brands.length === 0) return null;

  function brandSubLabel(brandId: string): string {
    const names = [...new Set(
      products
        .filter((p) => p.brandId === brandId && p.collectionName)
        .map((p) => p.collectionName!)
        .slice(0, 2)
    )];
    return names.length > 0 ? names.join(" · ") : "";
  }

  const displayBrands = brands.slice(0, 6);

  return (
    <View style={[styles.shell, { marginHorizontal: horizontalPadding }]}>
      <View style={styles.card}>
        {/* ✦ Glow blobs */}
        <View style={styles.glowGold} />
        <View style={styles.glowGreen} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>แบรนด์</Text>
          <Pressable style={styles.viewAllRow} onPress={onViewAll} hitSlop={8}>
            <Text style={styles.viewAllText}>ดูทั้งหมด</Text>
            <MaterialIcons name="chevron-right" size={14} color={colors.primaryDark} />
          </Pressable>
        </View>

        {/* Brand items — horizontal scroll เมื่อ > 3 */}
        <ScrollView
          horizontal={displayBrands.length > 3}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={displayBrands.length > 3}
          contentContainerStyle={[
            styles.brandsRow,
            displayBrands.length <= 3 && styles.brandsRowFixed,
          ]}
        >
          {displayBrands.map((brand) => {
            const sub = brandSubLabel(brand.id);
            return (
              <Pressable
                key={brand.id}
                style={styles.brandItem}
                onPress={() => onSelectBrand(brand.id, brand.name)}
              >
                {/* ✦ Gold ring circle */}
                <View style={styles.circleShell}>
                  <View style={styles.circle}>
                    {brand.imageUrl ? (
                      <CommerceImage
                        contentFit="cover"
                        style={styles.circleImg}
                        uri={brand.imageUrl}
                      />
                    ) : (
                      <MaterialIcons name="storefront" size={26} color={colors.sage} />
                    )}
                  </View>
                  {/* ✦ Gold dot badge */}
                  <View style={styles.goldDot}>
                    <MaterialIcons name="star" size={7} color={colors.goldDark} />
                  </View>
                </View>

                <Text numberOfLines={1} style={styles.brandName}>{brand.name}</Text>
                <Text numberOfLines={1} style={styles.brandSub}>{sub || " "}</Text>

                {/* ✦ Gold shop button */}
                <Pressable
                  style={styles.shopBtn}
                  onPress={() => onSelectBrand(brand.id, brand.name)}
                >
                  <MaterialIcons name="shopping-bag" size={11} color={colors.goldDark} />
                  <Text style={styles.shopBtnText}>ช้อป</Text>
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginBottom: spacing["2xl"],   // ✦ ลด margin เพราะไม่มี notch แล้ว
    marginTop: spacing["2xl"],
  },

  // ── Main card ──────────────────────────────────────────
  card: {
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#8EB397",
    paddingTop: 14,
    paddingBottom: 28,
    paddingHorizontal: 14,
    shadowColor: "#214530",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  // ✦ Gold glow (top-right) + green glow (bottom-left)
  glowGold: {
    position: "absolute",
    top: -16,
    right: -10,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(212,175,55,0.12)",
  },
  glowGreen: {
    position: "absolute",
    bottom: -28,
    left: -20,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(200,224,209,0.65)",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: "#173022",
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.primaryDark,
  },

  // Brand items layout
  brandsRow: {
    gap: 6,
    flexDirection: "row",
  },
  brandsRowFixed: {
    flex: 1,                        // ✦ เต็มความกว้าง
  },
  brandItem: {
    flex: 1,                        // ✦ แบ่ง space เท่ากันทุก column
    alignItems: "center",
    gap: 8,
  },

  // ✦ Gold ring circle — ใหญ่ขึ้น
  circleShell: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.goldSoft,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#F2F9F4",
    borderWidth: 1,
    borderColor: "#DCE9DF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  circleImg: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  // ✦ Gold dot badge
  goldDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  brandName: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: "#1a1a1a",
    textAlign: "center",
  },
  brandSub: {
    fontSize: 8,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: -4,
  },

  // ✦ Gold shop button — เต็มความกว้าง column
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    alignSelf: "stretch",           // ✦ เต็มความกว้าง brandItem
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: 7,
    shadowColor: colors.gold,
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  shopBtnText: {
    color: colors.goldDark,
    fontSize: 10,
    fontFamily: fonts.bold,
  },

  // notch removed
});
