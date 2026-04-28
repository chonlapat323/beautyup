import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ProductDetail">>();
  const addToCart = useAppStore((state) => state.addToCart);
  const product = useAppStore((state) =>
    state.products.find((item) => item.id === route.params.productId),
  );

  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  if (!product) return null;

  const images = (product.images && product.images.length > 0) ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const imageHeight = Math.round(width * 0.9);

  return (
    <Screen contentContainerStyle={styles.content} header={<AppHeader title={product.name} />}>
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigation.navigate("Home") },
          { label: "Categories", onPress: () => navigation.navigate("Categories") },
          {
            label: "Products",
            onPress: () => navigation.navigate("ProductList", { categoryId: product.categoryId }),
          },
          { label: product.name },
        ]}
      />

      {/* ── Image carousel ───────────────────────────────────────────────── */}
      <View style={[styles.carouselWrap, { height: imageHeight }]}>
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setActiveSlide(Math.round(e.nativeEvent.contentOffset.x / width))
          }
        >
          {images.map((uri, i) => (
            <View key={i} style={{ width, height: imageHeight, alignItems: "center", justifyContent: "center" }}>
              <ZoomableImage uri={uri} width={width} height={imageHeight} />
            </View>
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.dots} pointerEvents="none">
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>THB {product.price.toFixed(0)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>THB {product.originalPrice.toFixed(0)}</Text>
          )}
        </View>
        {!!product.description && (
          <Text style={styles.description}>{product.description}</Text>
        )}
        <Pressable
          onPress={() => {
            addToCart(product.id);
            navigation.navigate("Cart");
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>เพิ่มลงตะกร้า</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
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
  button: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
});
