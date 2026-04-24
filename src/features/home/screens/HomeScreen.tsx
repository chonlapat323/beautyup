import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, fonts, radius, spacing } from "@/theme";

const badgeNew  = require("../../../slide/new.png")  as ReturnType<typeof require>;
const badgeBest = require("../../../slide/best.png") as ReturnType<typeof require>;

// ─── Section header helper ─────────────────────────────────────────────────────
function SectionHead({
  eyebrow,
  title,
  subtitle,
  onViewAll,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
}) {
  return (
    <View style={sh.wrap}>
      <Text style={sh.eyebrow}>{eyebrow}</Text>
      <View style={sh.row}>
        <View style={{ flex: 1 }}>
          <Text style={sh.title}>{title}</Text>
          {subtitle ? <Text style={sh.subtitle}>{subtitle}</Text> : null}
        </View>
        {onViewAll && (
          <Pressable onPress={onViewAll} style={sh.pill}>
            <Text style={sh.pillText}>ดูทั้งหมด →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const sh = StyleSheet.create({
  wrap:     { paddingHorizontal: spacing["2xl"], marginBottom: spacing.lg, gap: 2 },
  eyebrow:  { fontSize: 10, fontFamily: fonts.monoSemi, color: colors.primary, letterSpacing: 1.4, textTransform: "uppercase" },
  row:      { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 2 },
  title:    { fontSize: 20, fontFamily: fonts.bold, color: colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 2 },
  pill:     { backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start", marginTop: 2 },
  pillText: { fontSize: 12, fontFamily: fonts.semiBold, color: colors.primary },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const { width } = useWindowDimensions();

  const categories    = useAppStore((s) => s.categories);
  const products      = useAppStore((s) => s.products);
  const banners       = useAppStore((s) => s.banners);
  const isLoading     = useAppStore((s) => s.isLoadingCatalog);
  const addToCart     = useAppStore((s) => s.addToCart);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);

  // Product count per category
  const countByCat = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.categoryId] = (acc[p.categoryId] ?? 0) + 1;
    return acc;
  }, {});

  // ── Banner carousel ──────────────────────────────────────────────────────────
  const bannerHeight = Math.round(width * 0.625); // 16:10
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerSlides = banners.length > 0 ? banners : [];

  // Ken Burns — single shared scale animation
  const kenBurns = useRef(new Animated.Value(1)).current;
  // CTA arrow nudge
  const arrowX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const kb = Animated.loop(
      Animated.sequence([
        Animated.timing(kenBurns, { toValue: 1.07, duration: 5000, useNativeDriver: true }),
        Animated.timing(kenBurns, { toValue: 1,    duration: 5000, useNativeDriver: true }),
      ])
    );
    const arrow = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowX, { toValue: 4,  duration: 550, useNativeDriver: true }),
        Animated.timing(arrowX, { toValue: 0,  duration: 550, useNativeDriver: true }),
      ])
    );
    kb.start();
    arrow.start();
    return () => { kb.stop(); arrow.stop(); };
  }, []);

  useEffect(() => {
    if (bannerSlides.length <= 1) return;
    const id = setInterval(() => {
      setActiveBanner((cur) => {
        const next = (cur + 1) % bannerSlides.length;
        bannerScrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [bannerSlides.length, width]);

  function getBannerPress(linkType: string, linkId?: string) {
    if (linkType === "product" && linkId)
      return () => navigation.navigate("ProductDetail", { productId: linkId });
    if (linkType === "category" && linkId) {
      const cat = categories.find((c) => c.id === linkId);
      if (cat?.requiresShadeSelection)
        return () => navigation.navigate("ShadeSelection", { categoryId: linkId });
      return () => navigation.navigate("ProductList", { categoryId: linkId });
    }
    return () => navigation.navigate("Categories");
  }

  function openCategory(id: string, requiresShadeSelection: boolean) {
    if (requiresShadeSelection) { navigation.navigate("ShadeSelection", { categoryId: id }); return; }
    navigation.navigate("ProductList", { categoryId: id });
  }

  // ── Bento grid dimensions ────────────────────────────────────────────────────
  const bentoGap   = spacing.md;
  const bentoAvail = width - spacing["2xl"] * 2;
  const bentoLargeW = Math.floor((bentoAvail - bentoGap) * 0.57);
  const bentoSmallW = bentoAvail - bentoGap - bentoLargeW;
  const BENTO_H     = 166;
  const bentoSmallH = Math.floor((BENTO_H - bentoGap) / 2);


  if (isLoading) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <HomeSkeleton />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>

      {/* ── Banner ───────────────────────────────────────────────────────── */}
      {bannerSlides.length > 0 && (
        <View style={[styles.bannerWrap, { height: bannerHeight }]}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
          >
            {bannerSlides.map((b) => (
              <Pressable key={b.id} onPress={getBannerPress(b.linkType, b.linkId)}>
                <View style={[styles.bannerSlide, { width: width, height: bannerHeight }]}>
                  {/* Ken Burns image */}
                  <Animated.Image
                    source={{ uri: b.imageUrl }}
                    style={[StyleSheet.absoluteFill, { transform: [{ scale: kenBurns }] }]}
                    resizeMode="cover"
                  />
                  <View style={[StyleSheet.absoluteFill, styles.bannerOverlay]} />

                  {/* Copy */}
                  <View style={styles.bannerCopy}>
                    <Text style={styles.bannerTitle}>{b.title}</Text>
                    <View style={styles.bannerCta}>
                      <Text style={styles.bannerCtaText}>{b.buttonLabel}</Text>
                      <Animated.View style={{ transform: [{ translateX: arrowX }] }}>
                        <MaterialIcons name="arrow-forward" size={13} color="#fff" />
                      </Animated.View>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {/* Badge — top right of active slide */}
          {bannerSlides[activeBanner]?.tag === "NEW" && (
            <View style={styles.bannerBadge} pointerEvents="none">
              <Image source={badgeNew} style={styles.bannerBadgeImg} resizeMode="contain" />
            </View>
          )}
          {bannerSlides[activeBanner]?.tag === "BEST SELLER" && (
            <View style={styles.bannerBadge} pointerEvents="none">
              <Image source={badgeBest} style={styles.bannerBadgeImg} resizeMode="contain" />
            </View>
          )}
        </View>
      )}

      {/* ── สินค้าแนะนำ ───────────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <>
          <SectionHead
            eyebrow="FOR YOUR SALON"
            title="สินค้าแนะนำ"
            subtitle="คัดเฉพาะสำหรับคุณ"
            onViewAll={() => navigation.navigate("Categories")}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productRow}>
            {featuredProducts.map((product) => (
              <Pressable key={product.id} style={styles.productCard}
                onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}>
                <View style={styles.productImageWrap}>
                  <CommerceImage uri={product.imageUrl} style={styles.productImage} />
                  {product.accentColor && product.accentColor !== "#2f7a4f" && (
                    <View style={[styles.shadeDot, { backgroundColor: product.accentColor }]} />
                  )}
                  {product.tag === "NEW" && (
                    <Image source={badgeNew} style={styles.productBadge} resizeMode="contain" />
                  )}
                  {product.tag === "BEST SELLER" && (
                    <Image source={badgeBest} style={styles.productBadge} resizeMode="contain" />
                  )}
                </View>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <View style={styles.productPriceRow}>
                  <Text style={styles.productPrice}>THB {product.price.toFixed(0)}</Text>
                  {product.originalPrice && (
                    <Text style={styles.productOriginalPrice}>THB {product.originalPrice.toFixed(0)}</Text>
                  )}
                </View>
                <Pressable onPress={(e) => { e.stopPropagation(); addToCart(product.id); }}
                  style={styles.addToCartBtn}>
                  <Text style={styles.addToCartText}>+ เพิ่มลงตะกร้า</Text>
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      {/* ── หมวดหมู่ — bento grid ─────────────────────────────────────────── */}
      {categories.length > 0 && (
        <>
          <SectionHead eyebrow="BROWSE" title="หมวดหมู่" subtitle="เลือกตามประเภทสินค้า" />

          <View style={styles.bentoGrid}>
            {/* Bento group: first 3 */}
            {categories.length >= 3 && (
              <View style={styles.bentoGroup}>
                {/* Large card */}
                <View style={[styles.bentoCellWrap, { width: bentoLargeW, height: BENTO_H }]}>
                  <Pressable style={styles.bentoCell}
                    onPress={() => openCategory(categories[0].id, categories[0].requiresShadeSelection)}>
                    <Animated.Image source={{ uri: categories[0].imageUrl }}
                      style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <View style={[StyleSheet.absoluteFill, styles.catOverlay]} />
                    <View style={styles.catCountBadge}>
                      <Text style={styles.catCountText}>{countByCat[categories[0].id] ?? 0} ชิ้น</Text>
                    </View>
                    <View style={styles.catCopy}>
                      <Text style={styles.catEn}>{categories[0].eyebrow || categories[0].slug?.toUpperCase()}</Text>
                      <Text style={styles.catTh}>{categories[0].title}</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Small stack */}
                <View style={[styles.bentoSmallStack, { width: bentoSmallW, gap: bentoGap }]}>
                  {[categories[1], categories[2]].map((cat) => (
                    <View key={cat.id} style={[styles.bentoCellWrap, { flex: 1 }]}>
                      <Pressable style={styles.bentoCell}
                        onPress={() => openCategory(cat.id, cat.requiresShadeSelection)}>
                        <Animated.Image source={{ uri: cat.imageUrl }}
                          style={StyleSheet.absoluteFill} resizeMode="cover" />
                        <View style={[StyleSheet.absoluteFill, styles.catOverlay]} />
                        <View style={styles.catCountBadge}>
                          <Text style={styles.catCountText}>{countByCat[cat.id] ?? 0} ชิ้น</Text>
                        </View>
                        <View style={styles.catCopy}>
                          <Text style={styles.catEn}>{cat.eyebrow || cat.slug?.toUpperCase()}</Text>
                          <Text style={styles.catTh}>{cat.title}</Text>
                        </View>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Remaining categories — 2-col */}
            {categories.slice(categories.length >= 3 ? 3 : 0).map((cat) => {
              const cellW = Math.floor((bentoAvail - bentoGap) / 2);
              return (
                <View key={cat.id} style={[styles.bentoCellWrap, { width: cellW, height: bentoSmallH * 2 + bentoGap }]}>
                  <Pressable style={styles.bentoCell}
                    onPress={() => openCategory(cat.id, cat.requiresShadeSelection)}>
                    <Animated.Image source={{ uri: cat.imageUrl }}
                      style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <View style={[StyleSheet.absoluteFill, styles.catOverlay]} />
                    <View style={styles.catCountBadge}>
                      <Text style={styles.catCountText}>{countByCat[cat.id] ?? 0} ชิ้น</Text>
                    </View>
                    <View style={styles.catCopy}>
                      <Text style={styles.catEn}>{cat.eyebrow || cat.slug?.toUpperCase()}</Text>
                      <Text style={styles.catTh}>{cat.title}</Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  content: { paddingBottom: 40 },

  // Banner
  bannerWrap: {
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  bannerSlide: {
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bannerOverlay: {
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  bannerBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  bannerBadgeImg: {
    width: 72,
    height: 72,
  },
  bannerCopy: { padding: 20, gap: 6 },
  bannerTitle: {
    color: "#fff", fontSize: 22,
    fontFamily: fonts.extraBold, lineHeight: 28,
  },
  bannerCta: {
    alignSelf: "flex-start", marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.5)",
    borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 7,
    flexDirection: "row", alignItems: "center", gap: 5,
  },
  bannerCtaText: {
    color: "#fff", fontSize: 13, fontFamily: fonts.bold,
  },

  // Products
  productRow: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  productCard: {
    width: 148, gap: 6,
    shadowColor: "#2f7a4f",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  productImageWrap: {
    width: 148, height: 197,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
  },
  productImage: { width: "100%", height: "100%" },
  productBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 54,
    height: 54,
  },
  shadeDot: {
    position: "absolute", top: 8, left: 8,
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: "#fff",
  },
  productName: {
    fontSize: 12, fontFamily: fonts.medium,
    color: colors.textPrimary, lineHeight: 16,
  },
  productPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  productPrice: { fontSize: 13, fontFamily: fonts.bold, color: colors.primary },
  productOriginalPrice: {
    fontSize: 11, fontFamily: fonts.regular,
    color: colors.textMuted, textDecorationLine: "line-through",
  },
  addToCartBtn: {
    height: 30, borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginTop: 2,
  },
  addToCartText: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.primary },

  // Bento grid
  bentoGrid: {
    paddingHorizontal: spacing["2xl"],
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  bentoGroup: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.md,
  },
  bentoSmallStack: { flexDirection: "column" },
  bentoCellWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bentoCell: {
    flex: 1,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  catOverlay: { backgroundColor: "rgba(0,0,0,0.36)" },
  catCountBadge: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: "rgba(255,255,255,0.20)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
    borderRadius: radius.pill,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  catCountText: {
    color: "#fff", fontSize: 9, fontFamily: fonts.semiBold,
  },
  catCopy: { padding: 10, gap: 1 },
  catEn: {
    fontSize: 9, fontFamily: fonts.monoSemi,
    color: "rgba(255,255,255,0.75)", letterSpacing: 1.0, textTransform: "uppercase",
  },
  catTh: { fontSize: 13, fontFamily: fonts.bold, color: "#fff" },
});
