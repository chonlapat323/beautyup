/**
 * HomeFeaturedSection — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • CTA "ใส่ตะกร้า": พื้นหลัง gold (#D4AF37) แทน muted green — ดูหรู + คลิกง่ายขึ้น
 * • เพิ่ม Heart (Wishlist) button — top-right ของ product card
 * • Active dot: เปลี่ยนเป็น gold สอดคล้องกัน
 * • Price: ใช้ goldDeep แทน primaryDark — เน้นความพรีเมียม
 * • เพิ่ม subtle gold border บน card เมื่อ isFeatured
 */

import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useMemo, useState } from "react";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { colors, fonts, spacing } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import type { Product } from "@/types/domain";

const badgeNew = require("../../../slide/new.png") as ReturnType<typeof require>;

type HomeFeaturedSectionProps = {
  products: Product[];
  horizontalPadding: number;
  onViewAll: () => void;
  onPressProduct: (productId: string) => void;
  onAddToCart: (productId: string) => void;
};

export function HomeFeaturedSection({
  products,
  horizontalPadding,
  onViewAll,
  onPressProduct,
  onAddToCart,
}: HomeFeaturedSectionProps) {
  const { width } = useWindowDimensions();
  const [activePage, setActivePage] = useState(0);
  const favoriteIds = useAppStore((state) => state.favoriteIds);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const pageWidth = width - horizontalPadding * 2;
  const cardGap = 14;
  const cardWidth = Math.floor((pageWidth - cardGap) / 2);

  const pages = useMemo(() => {
    const chunks: Product[][] = [];
    for (let i = 0; i < products.length; i += 2) {
      chunks.push(products.slice(i, i + 2));
    }
    return chunks;
  }, [products]);

  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={[styles.headerRow, { paddingHorizontal: horizontalPadding }]}>
        {/* ✦ เส้นทองซ้าย — สอดคล้องกับ SectionTitle component */}
        <View style={styles.headerLeft}>
          <View style={styles.goldBar} />
          <Text style={styles.title}>สินค้าแนะนำ</Text>
        </View>
        <Pressable hitSlop={8} onPress={onViewAll}>
          <Text style={styles.viewAll}>ดูทั้งหมด &gt;</Text>
        </Pressable>
      </View>

      {/* Product Grid (Paged) */}
      <View style={[styles.viewport, { marginHorizontal: horizontalPadding }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={pageWidth}
          disableIntervalMomentum
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
            setActivePage(index);
          }}
        >
          {pages.map((page, pageIndex) => (
            <View key={`page-${pageIndex}`} style={[styles.page, { width: pageWidth, gap: cardGap }]}>
              {page.map((product) => {
                const isFav = favoriteIds.includes(product.id);
                return (
                  <Pressable
                    key={product.id}
                    onPress={() => onPressProduct(product.id)}
                    style={[styles.card, { width: cardWidth }]}
                  >
                    {/* Image */}
                    <View style={styles.imageShell}>
                      <View style={styles.imageGlow} />
                      <CommerceImage contentFit="cover" style={styles.image} uri={product.imageUrl} />

                      {/* ✦ NEW: Wishlist heart button */}
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        style={styles.heartBtn}
                        hitSlop={8}
                      >
                        <MaterialIcons
                          name={isFav ? "favorite" : "favorite-border"}
                          size={18}
                          color={isFav ? "#E05252" : "rgba(255,255,255,0.85)"}
                        />
                      </Pressable>

                      {/* Badge NEW */}
                      {product.tag === "NEW" ? (
                        <View style={styles.badgeWrap}>
                          <Image resizeMode="contain" source={badgeNew} style={styles.badgeImage} />
                        </View>
                      ) : null}

                      {/* Badge BEST SELLER */}
                      {product.tag === "BEST SELLER" ? (
                        <View style={styles.bestSellerBadge}>
                          <Text style={styles.bestSellerText}>ขาย</Text>
                          <Text style={styles.bestSellerText}>ดี</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Copy */}
                    <View style={styles.copy}>
                      <Text numberOfLines={2} style={styles.productName}>
                        {product.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.productSubtitle}>
                        {product.subtitle}
                      </Text>
                    </View>

                    {/* Price Row */}
                    <View style={styles.priceRow}>
                      {/* ✦ CHANGED: goldDeep แทน primaryDark */}
                      <Text style={styles.price}>฿{product.price.toFixed(0)}</Text>
                      {product.originalPrice ? (
                        <Text style={styles.originalPrice}>฿{product.originalPrice.toFixed(0)}</Text>
                      ) : null}
                    </View>

                    {/* ✦ CHANGED: Gold CTA button */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        onAddToCart(product.id);
                      }}
                      style={styles.ctaButton}
                    >
                      <MaterialIcons name="add-shopping-cart" size={14} color={colors.goldDark} />
                      <Text style={styles.ctaText}>ใส่ตะกร้า</Text>
                    </Pressable>
                  </Pressable>
                );
              })}
              {page.length === 1 ? <View style={{ width: cardWidth }} /> : null}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ✦ CHANGED: Dots ใช้ gold active */}
      {pages.length > 1 ? (
        <View style={styles.dots}>
          {pages.map((_, index) => (
            <View key={index} style={[styles.dot, index === activePage && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing["2xl"],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  // ✦ NEW: เส้นทองซ้าย
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goldBar: {
    width: 3,
    height: 22,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    color: "#FFFFFF",
    fontFamily: fonts.bold,
  },
  viewAll: {
    fontSize: 13,
    color: colors.goldDeep,
    fontFamily: fonts.semiBold,
  },
  page: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  viewport: {
    overflow: "hidden",
  },
  card: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E6EFE8",
    shadowColor: "#214530",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  imageShell: {
    height: 178,
    borderRadius: 24,
    backgroundColor: "#F8FCF9",
    borderWidth: 1,
    borderColor: "#ECF3EE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  imageGlow: {
    position: "absolute",
    top: -12,
    right: -6,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(219, 238, 223, 0.55)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  // ✦ NEW: Heart button
  heartBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeWrap: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  badgeImage: {
    width: 50,
    height: 50,
  },
  bestSellerBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#D61F1F",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }],
    paddingTop: 2,
  },
  bestSellerText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 10,
    fontFamily: fonts.extraBold,
  },
  copy: {
    gap: 6,
    minHeight: 70,
  },
  productName: {
    fontSize: 15,
    lineHeight: 20,
    color: "#193125",
    fontFamily: fonts.bold,
  },
  productSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: "#7C8F82",
    fontFamily: fonts.medium,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  // ✦ CHANGED: goldDeep
  price: {
    fontSize: 16,
    color: colors.goldDeep,
    fontFamily: fonts.extraBold,
  },
  originalPrice: {
    fontSize: 11,
    color: "#A3B1A7",
    fontFamily: fonts.medium,
    textDecorationLine: "line-through",
  },
  // ✦ CHANGED: Gold CTA button
  ctaButton: {
    marginTop: 4,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: colors.gold,
    shadowOpacity: 0.30,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  ctaText: {
    fontSize: 13,
    color: colors.goldDark,
    fontFamily: fonts.bold,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D5DFD7",
  },
  // ✦ CHANGED: gold active
  dotActive: {
    width: 24,
    borderRadius: 8,
    backgroundColor: colors.gold,
  },
});
