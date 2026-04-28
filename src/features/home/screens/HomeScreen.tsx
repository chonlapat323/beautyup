import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, useWindowDimensions } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { HomeFeaturedSection } from "@/features/home/components/HomeFeaturedSection";
import { HomeHeroSliderSection } from "@/features/home/components/HomeHeroSliderSection";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { HomeCategoriesSection } from "@/features/home/components/HomeCategoriesSection";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const { width } = useWindowDimensions();

  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const banners = useAppStore((state) => state.banners);
  const isLoading = useAppStore((state) => state.isLoadingCatalog);
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 44,
    backgroundColor: "#F7FBF8",
  },
});
