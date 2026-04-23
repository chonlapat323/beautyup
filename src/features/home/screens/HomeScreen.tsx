import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { PointsPill } from "@/components/ui/PointsPill";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, fonts, radius, spacing } from "@/theme";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const { width } = useWindowDimensions();

  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const banners = useAppStore((state) => state.banners);
  const isLoadingCatalog = useAppStore((state) => state.isLoadingCatalog);
  const addToCart = useAppStore((state) => state.addToCart);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);

  // Banner carousel
  const bannerPad = spacing["2xl"];
  const bannerWidth = width - bannerPad * 2;
  const bannerHeight = Math.round((bannerWidth * 10) / 16);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerSlides = banners.length > 0 ? banners : [];

  useEffect(() => {
    if (bannerSlides.length <= 1) return;
    const id = setInterval(() => {
      setActiveBanner((cur) => {
        const next = (cur + 1) % bannerSlides.length;
        bannerScrollRef.current?.scrollTo({ x: next * (bannerWidth + spacing.md), animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [bannerSlides.length, bannerWidth]);

  function getBannerPress(linkType: string, linkId?: string) {
    if (linkType === "product" && linkId) {
      return () => navigation.navigate("ProductDetail", { productId: linkId });
    }
    if (linkType === "category" && linkId) {
      const cat = categories.find((c) => c.id === linkId);
      if (cat?.requiresShadeSelection) {
        return () => navigation.navigate("ShadeSelection", { categoryId: linkId });
      }
      return () => navigation.navigate("ProductList", { categoryId: linkId });
    }
    return () => navigation.navigate("Categories");
  }

  function openCategory(categoryId: string, requiresShadeSelection: boolean) {
    if (requiresShadeSelection) {
      navigation.navigate("ShadeSelection", { categoryId });
      return;
    }
    navigation.navigate("ProductList", { categoryId });
  }

  if (isLoadingCatalog) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BrandLockup compact />
        </View>
        <HomeSkeleton />
      </Screen>
    );
  }

  // Category grid — 2 columns
  const catPad = spacing["2xl"];
  const catGap = spacing.md;
  const catCellSize = (width - catPad * 2 - catGap) / 2;

  return (
    <Screen contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <BrandLockup compact />
        <PointsPill />
      </View>

      {/* Banner carousel */}
      {bannerSlides.length > 0 && (
        <View style={[styles.bannerSection, { paddingHorizontal: bannerPad }]}>
          <View style={{ borderRadius: radius.lg, overflow: "hidden" }}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled={false}
              decelerationRate="fast"
              disableIntervalMomentum
              snapToInterval={bannerWidth + spacing.md}
              snapToAlignment="start"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (bannerWidth + spacing.md));
                setActiveBanner(idx);
              }}
              contentContainerStyle={{ gap: spacing.md }}
              style={{ borderRadius: radius.lg }}
            >
              {bannerSlides.map((b) => (
                <Pressable key={b.id} onPress={getBannerPress(b.linkType, b.linkId)}>
                  <ImageBackground
                    source={{ uri: b.imageUrl }}
                    style={[styles.bannerSlide, { width: bannerWidth, height: bannerHeight }]}
                    imageStyle={{ borderRadius: radius.lg }}
                    resizeMode="cover"
                  >
                    {/* Dark overlay */}
                    <View style={[StyleSheet.absoluteFill, styles.bannerOverlay]} />

                    {/* Dots — top right */}
                    <View style={styles.bannerDots}>
                      {bannerSlides.map((_, di) => (
                        <View
                          key={di}
                          style={[
                            styles.bannerDot,
                            di === activeBanner ? styles.bannerDotActive : undefined,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Copy */}
                    <View style={styles.bannerCopy}>
                      <Text style={styles.bannerEyebrow}>{b.eyebrow}</Text>
                      <Text style={styles.bannerTitle}>{b.title}</Text>
                      <View style={styles.bannerCta}>
                        <Text style={styles.bannerCtaText}>{b.buttonLabel}</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* สินค้าแนะนำ */}
      {featuredProducts.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>สินค้าแนะนำ</Text>
            <Pressable onPress={() => navigation.navigate("Categories")}>
              <Text style={styles.sectionAction}>ดูทั้งหมด →</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productRow}
          >
            {featuredProducts.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
                style={styles.productCard}
              >
                {/* Image 3:4 */}
                <View style={styles.productImageWrap}>
                  <CommerceImage
                    uri={product.imageUrl}
                    style={styles.productImage}
                  />
                  {product.accentColor && product.accentColor !== "#2f7a4f" && (
                    <View style={[styles.shadeDot, { backgroundColor: product.accentColor }]} />
                  )}
                </View>

                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <View style={styles.productPriceRow}>
                  <Text style={styles.productPrice}>THB {product.price.toFixed(0)}</Text>
                  {product.originalPrice && (
                    <Text style={styles.productOriginalPrice}>THB {product.originalPrice.toFixed(0)}</Text>
                  )}
                </View>
                <Pressable
                  onPress={(e) => { e.stopPropagation(); addToCart(product.id); }}
                  style={styles.addToCartBtn}
                >
                  <Text style={styles.addToCartText}>+ เพิ่มลงตะกร้า</Text>
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      {/* หมวดหมู่ */}
      {categories.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>หมวดหมู่</Text>
          </View>

          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => openCategory(cat.id, cat.requiresShadeSelection)}
                style={[styles.categoryCell, { width: catCellSize, height: catCellSize }]}
              >
                <ImageBackground
                  source={{ uri: cat.imageUrl }}
                  style={StyleSheet.absoluteFill}
                  imageStyle={{ borderRadius: radius.lg }}
                  resizeMode="cover"
                >
                  <View style={[StyleSheet.absoluteFill, styles.catOverlay, { borderRadius: radius.lg }]} />
                  <View style={styles.catCopy}>
                    <Text style={styles.catEn}>{cat.eyebrow || cat.slug?.toUpperCase()}</Text>
                    <Text style={styles.catTh}>{cat.title}</Text>
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerSection: {
    marginBottom: spacing.xl,
  },
  bannerSlide: {
    borderRadius: radius.lg,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bannerOverlay: {
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  bannerDots: {
    position: "absolute",
    top: 12,
    right: 14,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  bannerDot: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  bannerDotActive: {
    width: 16,
    backgroundColor: "#fff",
  },
  bannerCopy: {
    padding: 18,
    gap: 6,
  },
  bannerEyebrow: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontFamily: fonts.semiBold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: fonts.bold,
    lineHeight: 26,
  },
  bannerCta: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  bannerCtaText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["2xl"],
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionAction: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  productRow: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  productCard: {
    width: 148,
    gap: 6,
  },
  productImageWrap: {
    width: 148,
    height: 197, // 3:4
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  shadeDot: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  productName: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  productPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  productPrice: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  productOriginalPrice: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  addToCartBtn: {
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  addToCartText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryCell: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    justifyContent: "flex-end",
  },
  catOverlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  catCopy: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 8,
    gap: 2,
  },
  catEn: {
    fontSize: 9,
    fontFamily: fonts.monoSemi,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
  catTh: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#fff",
  },
});
