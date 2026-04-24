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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "สวัสดีตอนเช้า";
  if (h < 17) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHead({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {onViewAll && (
        <Pressable onPress={onViewAll}>
          <Text style={sh.viewAll}>ดูทั้งหมด &gt;</Text>
        </Pressable>
      )}
    </View>
  );
}

const sh = StyleSheet.create({
  row:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing["2xl"], marginBottom: spacing.md },
  title:   { fontSize: 16, fontFamily: fonts.bold, color: colors.textPrimary },
  viewAll: { fontSize: 12, fontFamily: fonts.semiBold, color: colors.primary },
});

// ─── Main screen ───────────────────────────────────────────────────────────────
export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const { width } = useWindowDimensions();

  const categories = useAppStore((s) => s.categories);
  const products   = useAppStore((s) => s.products);
  const banners    = useAppStore((s) => s.banners);
  const isLoading  = useAppStore((s) => s.isLoadingCatalog);
  const member     = useAppStore((s) => s.member);
  const cart       = useAppStore((s) => s.cart);
  const addToCart  = useAppStore((s) => s.addToCart);

  const cartCount        = cart.reduce((sum, i) => sum + i.quantity, 0);
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);

  // ── Banner carousel ──────────────────────────────────────────────────────────
  const bannerHeight    = Math.round(width * 0.52);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerSlides    = banners.length > 0 ? banners : [];

  const kenBurns = useRef(new Animated.Value(1)).current;
  const arrowX   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const kb = Animated.loop(
      Animated.sequence([
        Animated.timing(kenBurns, { toValue: 1.06, duration: 5000, useNativeDriver: true }),
        Animated.timing(kenBurns, { toValue: 1,    duration: 5000, useNativeDriver: true }),
      ])
    );
    const arrow = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowX, { toValue: 4, duration: 550, useNativeDriver: true }),
        Animated.timing(arrowX, { toValue: 0, duration: 550, useNativeDriver: true }),
      ])
    );
    kb.start(); arrow.start();
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

  if (isLoading) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <HomeSkeleton />
      </Screen>
    );
  }

  const initials = member?.fullName?.trim().charAt(0).toUpperCase() ?? "?";

  return (
    <Screen contentContainerStyle={styles.content}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.memberName} numberOfLines={1}>
            {member?.fullName ?? "ผู้ใช้"}
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate("Cart")} style={styles.cartBtn}>
          <MaterialIcons name="shopping-bag" size={24} color={colors.primary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 99 ? "99+" : cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <Pressable style={styles.searchBar} onPress={() => navigation.navigate("Categories")}>
        <MaterialIcons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>ค้นหาสินค้า</Text>
      </Pressable>

      {/* ── Categories — horizontal circles ───────────────────────────────── */}
      {categories.length > 0 && (
        <>
          <SectionHead title="หมวดหมู่สินค้า" onViewAll={() => navigation.navigate("Categories")} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            {categories.slice(0, 8).map((cat) => (
              <Pressable
                key={cat.id}
                style={styles.catItem}
                onPress={() => openCategory(cat.id, cat.requiresShadeSelection)}
              >
                <View style={styles.catCircle}>
                  {cat.imageUrl ? (
                    <Image source={{ uri: cat.imageUrl }} style={styles.catCircleImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.catCircleImg, { backgroundColor: colors.primarySoft }]} />
                  )}
                </View>
                <Text style={styles.catLabel} numberOfLines={1}>{cat.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Banner ────────────────────────────────────────────────────────── */}
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
                <View style={[styles.bannerSlide, { width, height: bannerHeight }]}>
                  <Animated.Image
                    source={{ uri: b.imageUrl }}
                    style={[StyleSheet.absoluteFill, { transform: [{ scale: kenBurns }] }]}
                    resizeMode="cover"
                  />
                  <View style={[StyleSheet.absoluteFill, styles.bannerOverlay]} />
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

          {/* Dots — bottom center */}
          <View style={styles.bannerDots} pointerEvents="none">
            {bannerSlides.map((_, di) => (
              <View key={di} style={[styles.bannerDot, di === activeBanner && styles.bannerDotActive]} />
            ))}
          </View>

          {/* Badge */}
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
            title="สินค้าแนะนำ"
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

    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  content: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  greeting: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  memberName: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: fonts.bold,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing["2xl"],
    marginBottom: spacing.xl,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },

  // Categories
  catRow: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  catItem: {
    alignItems: "center",
    gap: 6,
    width: 64,
  },
  catCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.sage,
  },
  catCircleImg: {
    width: "100%",
    height: "100%",
  },
  catLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Banner
  bannerWrap: {
    marginHorizontal: spacing["2xl"],
    marginBottom: spacing.xl,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  bannerSlide: {
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bannerOverlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  bannerDots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  bannerDot: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  bannerDotActive: { width: 18, backgroundColor: "#fff" },
  bannerCopy: { padding: 18, gap: 6 },
  bannerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: fonts.extraBold,
    lineHeight: 26,
  },
  bannerCta: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  bannerCtaText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: fonts.bold,
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

  // Products
  productRow: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  productCard: {
    width: 148,
    gap: 6,
    shadowColor: "#2f7a4f",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  productImageWrap: {
    width: 148,
    height: 197,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
  },
  productImage: { width: "100%", height: "100%" },
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
  productBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 54,
    height: 54,
  },
  productName: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  productPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  productPrice: { fontSize: 13, fontFamily: fonts.bold, color: colors.primary },
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
  addToCartText: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.primary },
});
