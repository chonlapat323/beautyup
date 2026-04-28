import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useMemo, useState } from "react";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { colors, fonts, spacing } from "@/theme";
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
      <View
        style={[
          styles.headerRow,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        <Text style={styles.title}>Featured</Text>
        <Pressable hitSlop={8} onPress={onViewAll}>
          <Text style={styles.viewAll}>View all &gt;</Text>
        </Pressable>
      </View>

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
            <View
              key={`featured-page-${pageIndex}`}
              style={[styles.page, { width: pageWidth, gap: cardGap }]}
            >
              {page.map((product) => (
                <Pressable
                  key={product.id}
                  onPress={() => onPressProduct(product.id)}
                  style={[styles.card, { width: cardWidth }]}
                >
                  <View style={styles.imageShell}>
                    <View style={styles.imageGlow} />
                    <CommerceImage
                      resizeMode="contain"
                      style={styles.image}
                      uri={product.imageUrl}
                    />
                    {product.tag === "NEW" ? (
                      <View style={styles.badgeWrap}>
                        <Image resizeMode="contain" source={badgeNew} style={styles.badgeImage} />
                      </View>
                    ) : null}
                    {product.tag === "BEST SELLER" ? (
                      <View style={styles.bestSellerBadge}>
                        <Text style={styles.bestSellerText}>BEST</Text>
                        <Text style={styles.bestSellerText}>SELLER</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.copy}>
                    <Text numberOfLines={2} style={styles.productName}>
                      {product.name}
                    </Text>
                    <Text numberOfLines={2} style={styles.productSubtitle}>
                      {product.subtitle}
                    </Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>THB {product.price.toFixed(0)}</Text>
                    {product.originalPrice ? (
                      <Text style={styles.originalPrice}>
                        THB {product.originalPrice.toFixed(0)}
                      </Text>
                    ) : null}
                  </View>

                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      onAddToCart(product.id);
                    }}
                    style={styles.ctaButton}
                  >
                    <Text style={styles.ctaText}>Add to cart</Text>
                  </Pressable>
                </Pressable>
              ))}

              {page.length === 1 ? <View style={{ width: cardWidth }} /> : null}
            </View>
          ))}
        </ScrollView>
      </View>

      {pages.length > 1 ? (
        <View style={styles.dots}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activePage && styles.dotActive]}
            />
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
  title: {
    fontSize: 20,
    lineHeight: 24,
    color: "#173022",
    fontFamily: fonts.bold,
  },
  viewAll: {
    fontSize: 13,
    color: colors.primary,
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
    width: "78%",
    height: "78%",
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
    gap: 8,
    minHeight: 76,
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
  price: {
    fontSize: 15,
    color: colors.primaryDark,
    fontFamily: fonts.extraBold,
  },
  originalPrice: {
    fontSize: 11,
    color: "#A3B1A7",
    fontFamily: fonts.medium,
    textDecorationLine: "line-through",
  },
  ctaButton: {
    marginTop: 4,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF7F0",
    borderWidth: 1,
    borderColor: "#DDEBE0",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 13,
    color: colors.primaryDark,
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
  dotActive: {
    width: 24,
    borderRadius: 8,
    backgroundColor: colors.primaryDark,
  },
});
