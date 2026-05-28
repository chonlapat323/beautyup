import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { HomeBundleSection } from "@/features/home/components/HomeBundleSection";
import { HomeFeaturedSection } from "@/features/home/components/HomeFeaturedSection";
import { HomeHeroSliderSection } from "@/features/home/components/HomeHeroSliderSection";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { HomeCategoriesSection } from "@/features/home/components/HomeCategoriesSection";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, typography } from "@/theme";

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const { width } = useWindowDimensions();

  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const banners = useAppStore((state) => state.banners);
  const social = useAppStore((state) => state.social);
  const isLoading = useAppStore((state) => state.isLoadingCatalog);
  const bundles = useAppStore((state) => state.bundles);
  const addToCart = useAppStore((state) => state.addToCart);
  const loadCatalog = useAppStore((state) => state.loadCatalog);

  const featuredProducts = (
    products.filter((product) => product.isFeatured).length > 0
      ? products.filter((product) => product.isFeatured)
      : products
  ).slice(0, 8);
  const heroSlides = (banners.length > 0 ? banners : []).slice(0, 4);

  const horizontalPadding = width < 360 ? 18 : width >= 430 ? 28 : 24;
  function openCategory(categoryId: string, requiresShadeSelection: boolean) {
    if (requiresShadeSelection) {
      navigation.navigate("ShadeSelection", { categoryId });
      return;
    }

    navigation.navigate("ProductList", { categoryId });
  }

  function openBanner(linkType: string, linkId?: string) {
    if (linkType === "product" && linkId) {
      navigation.navigate("ProductDetail", { productId: linkId });
      return;
    }

    if (linkType === "category" && linkId) {
      const category = categories.find((item) => item.id === linkId);
      if (category?.requiresShadeSelection) {
        navigation.navigate("ShadeSelection", { categoryId: linkId });
        return;
      }

      navigation.navigate("ProductList", { categoryId: linkId });
      return;
    }

    navigation.navigate("Categories");
  }

  if (isLoading) {
    return (
      <Screen
        header={<AppHeader showSearch onSearchPress={() => navigation.navigate("Search")} />}
        contentContainerStyle={styles.content}
      >
        <HomeSkeleton />
      </Screen>
    );
  }

  return (
    <Screen
      header={<AppHeader showSearch onSearchPress={() => navigation.navigate("Search")} />}
      contentContainerStyle={styles.content}
      onRefresh={loadCatalog}
    >
      <HomeCategoriesSection
        categories={categories}
        horizontalPadding={horizontalPadding}
        onSelectCategory={openCategory}
        onViewAll={() => navigation.navigate("Categories")}
      />

      {heroSlides.length > 0 ? (
        <HomeHeroSliderSection
          banners={heroSlides}
          horizontalPadding={horizontalPadding}
          onPressBanner={openBanner}
        />
      ) : null}

      {featuredProducts.length > 0 ? (
        <HomeFeaturedSection
          products={featuredProducts}
          horizontalPadding={horizontalPadding}
          onViewAll={() => navigation.navigate("Categories")}
          onPressProduct={(productId) =>
            navigation.navigate("ProductDetail", { productId })
          }
          onAddToCart={addToCart}
        />
      ) : null}

      {bundles.length > 0 ? (
        <HomeBundleSection
          bundles={bundles}
          horizontalPadding={horizontalPadding}
          onAddToCart={addToCart}
        />
      ) : null}

      {(social.youtubeUrl || social.tiktokUrl || social.lineOaUrl) ? (
        <View style={[styles.socialRow, { paddingHorizontal: horizontalPadding }]}>
          {/* Labels row */}
          <View style={styles.socialLabelRow}>
            {(social.youtubeUrl || social.tiktokUrl) ? (
              <Text style={[styles.socialLabel, styles.socialLabelLeft]}>ติดตามเรา</Text>
            ) : null}
            {social.lineOaUrl ? (
              <Text style={[styles.socialLabel, styles.socialLabelRight]}>ติดต่อสอบถาม</Text>
            ) : null}
          </View>
          {/* Buttons row */}
          <View style={styles.socialLabelRow}>
            <View style={styles.socialButtons}>
              {social.youtubeUrl ? (
                <Pressable
                  style={[styles.socialBtn, styles.youtubeBtn]}
                  onPress={() => void Linking.openURL(social.youtubeUrl!)}
                >
                  <Text numberOfLines={1} style={styles.socialBtnText}>▶ YouTube</Text>
                </Pressable>
              ) : null}
              {social.tiktokUrl ? (
                <Pressable
                  style={[styles.socialBtn, styles.tiktokBtn]}
                  onPress={() => void Linking.openURL(social.tiktokUrl!)}
                >
                  <Text numberOfLines={1} style={styles.socialBtnText}>♪ TikTok</Text>
                </Pressable>
              ) : null}
            </View>
            {social.lineOaUrl ? (
              <Pressable
                style={[styles.socialBtn, styles.lineOaBtn]}
                onPress={() => void Linking.openURL(social.lineOaUrl!)}
              >
                <Text numberOfLines={1} style={styles.socialBtnText}>💬 Line OA</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 44,
    backgroundColor: colors.background,
  },
  socialRow: {
    marginTop: 32,
    gap: 12,
  },
  socialLabel: {
    color: colors.textSecondary,
    ...typography.caption,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  socialButtons: {
    flexDirection: "row" as const,
    gap: 10,
  },
  socialBtn: {
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center" as const,
    flexShrink: 1,
  },
  youtubeBtn: {
    backgroundColor: "#FF0000",
  },
  tiktokBtn: {
    backgroundColor: "#010101",
  },
  lineOaBtn: {
    backgroundColor: "#06C755",
  },
  socialLabelRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  socialLabelLeft: {
    flex: 1,
  },
  socialLabelRight: {
    textAlign: "right" as const,
  },
  socialBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700" as const,
  },
});
