import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { HomeBrandSection } from "@/features/home/components/HomeBrandSection";
import { HomeBrandGridSection } from "@/features/home/components/HomeBrandGridSection";
import { HomeBundleSection } from "@/features/home/components/HomeBundleSection";
import { HomeFeaturedSection } from "@/features/home/components/HomeFeaturedSection";
import { HomeHeroSliderSection } from "@/features/home/components/HomeHeroSliderSection";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, typography } from "@/theme";

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const { width } = useWindowDimensions();

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
  function openBanner(linkType: string, linkId?: string) {
    if (linkType === "product" && linkId) {
      navigation.navigate("ProductDetail", { productId: linkId });
      return;
    }

    if (linkType === "category" && linkId) {
      navigation.navigate("ProductList", { categoryId: linkId });
      return;
    }

    navigation.navigate("Categories");
  }

  if (isLoading) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <AppHeader dark showSearch onSearchPress={() => navigation.navigate("Search")} />
        <HomeSkeleton />
      </Screen>
    );
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      onRefresh={loadCatalog}
    >
      <AppHeader dark showSearch onSearchPress={() => navigation.navigate("Search")} />
      {heroSlides.length > 0 ? (
        <HomeHeroSliderSection
          banners={heroSlides}
          horizontalPadding={horizontalPadding}
          onPressBanner={openBanner}
        />
      ) : null}

      <HomeBrandGridSection
        horizontalPadding={horizontalPadding}
        onSelectBrand={(brandId) => navigation.navigate("ProductList", { brandId })}
        onViewAll={() => navigation.getParent()?.navigate("Shop")}
      />

      {/* HomeBrandSection slide — hidden per user request */}

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
        />
      ) : null}

      {(social.youtubeUrl || social.tiktokUrl || social.lineOaUrl) ? (
        <View style={[styles.socialRow, { paddingHorizontal: horizontalPadding }]}>
          {/* Labels row */}
          <View style={styles.socialCols}>
            <Text style={[styles.socialLabel, styles.colLeft]}>ติดตามเรา</Text>
            <View style={styles.colMid} />
            <Text style={[styles.socialLabel, styles.colRight]}>ติดต่อสอบถาม</Text>
          </View>
          {/* Buttons row — 3 equal columns */}
          <View style={styles.socialCols}>
            {social.youtubeUrl ? (
              <Pressable
                style={[styles.socialBtn, styles.youtubeBtn, styles.colLeft]}
                onPress={() => void Linking.openURL(social.youtubeUrl!)}
              >
                <Text numberOfLines={1} style={styles.socialBtnText}>▶ YouTube</Text>
              </Pressable>
            ) : <View style={styles.colLeft} />}
            {social.tiktokUrl ? (
              <Pressable
                style={[styles.socialBtn, styles.tiktokBtn, styles.colMid]}
                onPress={() => void Linking.openURL(social.tiktokUrl!)}
              >
                <Text numberOfLines={1} style={styles.socialBtnText}>♪ TikTok</Text>
              </Pressable>
            ) : <View style={styles.colMid} />}
            {social.lineOaUrl ? (
              <Pressable
                style={[styles.socialBtn, styles.lineOaBtn, styles.colRight]}
                onPress={() => void Linking.openURL(social.lineOaUrl!)}
              >
                <Text numberOfLines={1} style={styles.socialBtnText}>💬 Line OA</Text>
              </Pressable>
            ) : <View style={styles.colRight} />}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 0,
    paddingBottom: 44,
    backgroundColor: colors.background,
  },
  socialRow: {
    marginTop: 24,
    gap: 12,
  },
  socialLabel: {
    color: "#FFFFFF",
    ...typography.caption,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  socialCols: {
    flexDirection: "row" as const,
    gap: 8,
  },
  colLeft: {
    flex: 1,
  },
  colMid: {
    flex: 1,
  },
  colRight: {
    flex: 1,
  },
  socialBtn: {
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
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
  socialBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700" as const,
  },
});
