/**
 * ProductDetailScreen — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • ไม่ใช้ AppHeader — minimal header (title + back + breadcrumb)
 * • ราคา: เปลี่ยนจาก white → gold (#D4AF37) — premium feel
 * • Stepper: gold circle buttons (สอดคล้อง CartScreen v2)
 * • Active dot (image carousel): gold แทน primary green
 * • Stock badge: pill shape + icon สอดคล้องกับธีม
 * • ✦ Bottom bar: เปลี่ยนจาก 2 full-width buttons →
 *     [Cart icon btn (ไปที่ตะกร้า)] + [Gold pill (เพิ่มลงตะกร้า)]
 *     ลดความสูงจาก ~140px เหลือ ~72px
 * • Bottom bar: border-top-left/right-radius: 22 (rounded top)
 */

import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { FLOAT_TAB_HEIGHT, FLOAT_TAB_MARGIN } from "@/navigation/AppTabs";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { navigateToCategories, navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

export function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ProductDetail">>();
  const insets = useSafeAreaInsets();
  const addToCart = useAppStore((state) => state.addToCart);
  const cart = useAppStore((state) => state.cart);
  const foundProduct = useAppStore((state) =>
    state.products.find((item) => item.id === route.params.productId),
  );

  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const carouselRef = useRef<ScrollView>(null);
  const cardWidth = width - 40;

  if (!foundProduct) return null;

  const product = foundProduct;
  const shadeName = route.params.shadeName;
  const stock = product.sellableStock ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= (product.totalStock ?? stock) * 0.5;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const tabOffset = FLOAT_TAB_HEIGHT + FLOAT_TAB_MARGIN + (insets.bottom > 0 ? insets.bottom : 0);
  const bottomBarHeight = 72 + Math.max(insets.bottom, 12);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function handleAddToCart() {
    addToCart(product.id, quantity);
    navigation.navigate("Cart");
  }

  return (
    <View style={styles.screen}>
      <Screen
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomBarHeight + tabOffset + spacing.lg },
        ]}
      >
        {/* ✦ Minimal page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle} numberOfLines={3}>{product.name}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
            <MaterialIcons name="arrow-back-ios" size={12} color={colors.goldDeep} />
            <Text style={styles.backText}>ย้อนกลับ</Text>
          </Pressable>
        </View>

        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          {[
            { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
            { label: "หมวดหมู่สินค้า", onPress: () => navigateToCategories(navigation) },
            { label: "สินค้า", onPress: () => navigation.navigate("ProductList", { categoryId: product.categoryId }) },
            { label: "รายละเอียดสินค้า" },
          ].map((item, i, arr) => (
            <View key={i} style={styles.bcItem}>
              {item.onPress ? (
                <Text style={styles.bcLink} onPress={item.onPress}>{item.label}</Text>
              ) : (
                <Text style={styles.bcCur}>{item.label}</Text>
              )}
              {i < arr.length - 1 && <Text style={styles.bcSep}>/</Text>}
            </View>
          ))}
        </View>

        {/* Image Carousel — white rounded card */}
        <View style={styles.carouselCard}>
          <ScrollView
            ref={carouselRef}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setActiveSlide(Math.round(e.nativeEvent.contentOffset.x / (width - 40)))
            }
          >
            {images.map((uri, index) => (
              <View key={index} style={[styles.slideItem, { width: cardWidth }]}>
                <ZoomableImage uri={uri} width={cardWidth} height={Math.round(cardWidth * 0.85)} contentFit="cover" />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Dots — below card */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Body */}
        <View style={styles.body}>
          {/* Brand + tag */}
          <View style={styles.metaRow}>
            {product.brandName ? (
              <Text style={styles.brandName}>{product.brandName}</Text>
            ) : null}
            {product.tag ? (
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{product.tag}</Text>
              </View>
            ) : null}
          </View>

          {/* ✦ Gold price — ขึ้นมาก่อน */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>฿{product.price.toFixed(0)}</Text>
            {product.originalPrice ? (
              <Text style={styles.originalPrice}>฿{product.originalPrice.toFixed(0)}</Text>
            ) : null}
          </View>

          {/* Shade */}
          {shadeName && (
            <View style={styles.shadeRow}>
              <View style={[styles.shadeDot, { backgroundColor: product.accentColor }]} />
              <Text style={styles.shadeName}>{shadeName}</Text>
            </View>
          )}

          {/* Stock badge */}
          {isOutOfStock ? (
            <View style={[styles.stockBadge, styles.stockBadgeOut]}>
              <MaterialIcons name="remove-circle-outline" size={12} color="#DC2626" />
              <Text style={[styles.stockText, { color: "#DC2626" }]}>สินค้าหมด</Text>
            </View>
          ) : isLowStock ? (
            <View style={[styles.stockBadge, styles.stockBadgeLow]}>
              <MaterialIcons name="warning-amber" size={12} color="#D97706" />
              <Text style={[styles.stockText, { color: "#D97706" }]}>ใกล้หมด</Text>
            </View>
          ) : (
            <View style={[styles.stockBadge, styles.stockBadgeIn]}>
              <MaterialIcons name="check-circle-outline" size={12} color="#4ade80" />
              <Text style={[styles.stockText, { color: "rgba(255,255,255,0.85)" }]}>มีสินค้า</Text>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {/* ✦ Quantity — gold stepper */}
          <View style={styles.quantityBlock}>
            <Text style={styles.quantityLabel}>จำนวน</Text>
            <View style={[styles.stepper, isOutOfStock && styles.stepperDisabled]}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.stepBtn}
                disabled={isOutOfStock}
              >
                <MaterialIcons name="remove" size={14} color={colors.goldDark} />
              </Pressable>
              <Text style={styles.stepperCount}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                style={styles.stepBtn}
                disabled={isOutOfStock}
              >
                <MaterialIcons name="add" size={14} color={colors.goldDark} />
              </Pressable>
            </View>
          </View>
        </View>
      </Screen>

      {/* ✦ CHANGED: Compact bottom bar — icon btn + gold pill */}
      <View style={[styles.bottomBar, { bottom: tabOffset + 10 }]}>

        {/* ไปที่ตะกร้า — icon circle button */}
        <Pressable
          onPress={() => navigation.navigate("Cart")}
          style={styles.cartIconBtn}
          hitSlop={6}
        >
          <MaterialIcons name="shopping-cart" size={22} color="#fff" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 9 ? "9+" : cartCount}</Text>
            </View>
          )}
        </Pressable>

        {/* เพิ่มลงตะกร้า — gold pill */}
        <Pressable
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
        >
          <MaterialIcons
            name="add-shopping-cart"
            size={18}
            color={isOutOfStock ? "#fff" : colors.goldDark}
          />
          <Text style={[styles.addBtnText, isOutOfStock && styles.addBtnTextDisabled]}>
            {isOutOfStock ? "สินค้าหมด" : `เพิ่มลงตะกร้า${quantity > 1 ? ` (${quantity})` : ""}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: spacing.lg, backgroundColor: colors.background },

  // Header
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: fonts.extraBold,
    lineHeight: 30,
    flex: 1,
    paddingRight: 10,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingTop: 4 },
  backText: { color: colors.goldDeep, fontSize: 12, fontFamily: fonts.semiBold },

  // Breadcrumb
  breadcrumb: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 4,
  },
  bcItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  bcLink: { color: colors.gold, fontSize: 10, fontFamily: fonts.semiBold },
  bcSep: { color: "rgba(255,255,255,0.3)", fontSize: 10 },
  bcCur: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: fonts.medium },

  // Carousel — white card
  carouselCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "#F8FCF9",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.goldMuted,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  slideItem: {
    overflow: "hidden",
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { width: 16, borderRadius: 6, backgroundColor: colors.gold },

  // Body
  body: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },

  // Brand + tag row
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandName: { color: colors.gold, fontSize: 12, fontFamily: fonts.semiBold, letterSpacing: 0.5 },
  tagBadge: { backgroundColor: colors.primaryDark, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: "#FFFFFF", fontSize: 10, fontFamily: fonts.bold },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: fonts.medium },

  // Price — ✦ gold
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  price: { color: colors.gold, fontSize: 30, fontFamily: fonts.extraBold, lineHeight: 40 },
  originalPrice: { color: "rgba(255,255,255,0.45)", fontSize: 16, textDecorationLine: "line-through", fontFamily: fonts.medium },

  // Shade
  shadeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  shadeDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.35)" },
  shadeName: { color: "rgba(255,255,255,0.88)", fontSize: 13, fontFamily: fonts.semiBold },

  // Stock badge — pill
  stockBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  stockBadgeIn: { backgroundColor: "rgba(255,255,255,0.1)" },
  stockBadgeLow: { backgroundColor: "rgba(254,243,199,0.18)" },
  stockBadgeOut: { backgroundColor: "rgba(254,226,226,0.18)" },
  stockText: { fontSize: 11, fontFamily: fonts.semiBold },

  // Description
  description: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: fonts.regular, lineHeight: 20 },

  // Quantity
  quantityBlock: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quantityLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: fonts.medium },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepperDisabled: { opacity: 0.4 },
  // ✦ Gold circle step button
  stepBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: "center", justifyContent: "center",
    shadowColor: colors.gold, shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  stepperCount: { color: "#FFFFFF", fontSize: 16, fontFamily: fonts.bold, minWidth: 24, textAlign: "center" },

  // ✦ CHANGED: Compact bottom bar
  bottomBar: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,  // sits above tab bar via paddingBottom on Screen
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 18,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: "rgba(212,175,55,0.2)",
    // ✦ Rounded top
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  // Cart icon button (ไปที่ตะกร้า)
  cartIconBtn: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0, position: "relative",
  },
  cartBadge: {
    position: "absolute", top: -3, right: -3,
    backgroundColor: colors.gold, borderRadius: 999,
    minWidth: 16, height: 16,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: colors.goldDark, fontSize: 8, fontFamily: fonts.bold },

  // ✦ Gold pill — primary CTA
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: 14,
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addBtnDisabled: { backgroundColor: colors.textMuted, shadowOpacity: 0 },
  addBtnText: { color: colors.goldDark, fontSize: 15, fontFamily: fonts.bold },
  addBtnTextDisabled: { color: "#fff" },
});
