import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { navigateToCategories, navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ProductDetail">>();
  const insets = useSafeAreaInsets();
  const addToCart = useAppStore((state) => state.addToCart);
  const foundProduct = useAppStore((state) =>
    state.products.find((item) => item.id === route.params.productId),
  );

  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const carouselRef = useRef<ScrollView>(null);

  if (!foundProduct) return null;

  const product = foundProduct;
  const shadeName = route.params.shadeName;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const imageHeight = Math.round(width * 0.9);
  const bottomBarHeight = 88 + insets.bottom;

  function handleAddToCart() {
    addToCart(product.id, quantity);
    navigation.navigate("Cart");
  }

  return (
    <View style={styles.screen}>
      <Screen
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomBarHeight + spacing.xl },
        ]}
        header={
          <AppHeader
            title={product.name}
            breadcrumbs={[
              { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
              { label: "หมวดหมู่สินค้า", onPress: () => navigateToCategories(navigation) },
              {
                label: "สินค้า",
                onPress: () => navigation.navigate("ProductList", { categoryId: product.categoryId }),
              },
              { label: "รายละเอียดสินค้า" },
            ]}
          />
        }
      >
        <View style={[styles.carouselWrap, { height: imageHeight }]}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) =>
              setActiveSlide(Math.round(event.nativeEvent.contentOffset.x / width))
            }
          >
            {images.map((uri, index) => (
              <View
                key={index}
                style={{ width, height: imageHeight, alignItems: "center", justifyContent: "center" }}
              >
                <ZoomableImage uri={uri} width={width} height={imageHeight} />
              </View>
            ))}
          </ScrollView>

          {images.length > 1 ? (
            <View style={styles.dots} pointerEvents="none">
              {images.map((_, index) => (
                <View key={index} style={[styles.dot, index === activeSlide && styles.dotActive]} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>THB {product.price.toFixed(0)}</Text>
            {product.originalPrice ? (
              <Text style={styles.originalPrice}>THB {product.originalPrice.toFixed(0)}</Text>
            ) : null}
          </View>

          {shadeName ? (
            <View style={styles.shadeRow}>
              <View style={styles.shadeDot} />
              <Text style={styles.shadeName}>{shadeName}</Text>
            </View>
          ) : null}

          {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

          <View style={styles.quantityBlock}>
            <Text style={styles.quantityLabel}>จำนวน</Text>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <Text style={styles.stepperCount}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Screen>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={handleAddToCart} style={styles.button}>
          <Text style={styles.buttonText}>เพิ่มลงตะกร้า {quantity > 1 ? `(${quantity})` : ""}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.lg,
  },
  carouselWrap: {
    backgroundColor: colors.surfaceMuted,
  },
  dots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  body: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["2xl"],
    gap: spacing.lg,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
  },
  price: {
    color: colors.primaryStrong,
    ...typography.headline,
  },
  originalPrice: {
    color: colors.textMuted,
    fontSize: 16,
    textDecorationLine: "line-through",
  },
  shadeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  shadeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  shadeName: {
    color: colors.primaryStrong,
    ...typography.caption,
    fontWeight: "600",
  },
  description: {
    color: colors.textSecondary,
    ...typography.body,
  },
  quantityBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  quantityLabel: {
    color: colors.textSecondary,
    ...typography.body,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  stepperBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  stepperBtnText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "600",
    lineHeight: 24,
  },
  stepperCount: {
    width: 44,
    textAlign: "center",
    color: colors.textPrimary,
    ...typography.title,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing["2xl"],
  },
  button: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
    shadowColor: "#1D412D",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
});
