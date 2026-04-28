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
  const product = useAppStore((state) =>
    state.products.find((item) => item.id === route.params.productId),
  );

  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  if (!product) return null;

  const currentProduct = product;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const imageHeight = Math.round(width * 0.9);
  const bottomBarHeight = 88 + insets.bottom;

  function handleAddToCart() {
    addToCart(product.id);
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
                onPress: () =>
                  navigation.navigate("ProductList", { categoryId: currentProduct.categoryId }),
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
            <Text style={styles.price}>THB {currentProduct.price.toFixed(0)}</Text>
            {currentProduct.originalPrice ? (
              <Text style={styles.originalPrice}>THB {currentProduct.originalPrice.toFixed(0)}</Text>
            ) : null}
          </View>
          {currentProduct.description ? (
            <Text style={styles.description}>{currentProduct.description}</Text>
          ) : null}
        </View>
      </Screen>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={handleAddToCart} style={styles.button}>
          <Text style={styles.buttonText}>เพิ่มลงตะกร้า</Text>
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
  description: {
    color: colors.textSecondary,
    ...typography.body,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing["2xl"],
    backgroundColor: "rgba(247, 251, 248, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(31, 82, 54, 0.08)",
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
