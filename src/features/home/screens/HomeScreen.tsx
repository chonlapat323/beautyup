import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
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
import { HeroSlide } from "@/components/ui/HeroSlide";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const { width } = useWindowDimensions();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const banners = useAppStore((state) => state.banners);
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const slideWidth = width - spacing["2xl"] * 2;

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

  const categorySlides = categories.map((cat) => {
    const firstProduct = products.find((p) => p.categoryId === cat.id && p.imageUrl);
    return {
      id: cat.id,
      eyebrow: cat.eyebrow,
      title: cat.title,
      body: cat.subtitle,
      buttonLabel: cat.requiresShadeSelection ? "เลือกเฉดสี" : "ดูสินค้า",
      imageUrl: firstProduct?.imageUrl ?? cat.imageUrl,
      onPress: cat.requiresShadeSelection
        ? () => navigation.navigate("ShadeSelection", { categoryId: cat.id })
        : () => navigation.navigate("ProductList", { categoryId: cat.id }),
    };
  });

  const heroSlides =
    banners.length > 0
      ? banners.map((b) => ({
          id: b.id,
          eyebrow: b.eyebrow,
          title: b.title,
          body: b.body ?? "",
          buttonLabel: b.buttonLabel,
          imageUrl: b.imageUrl,
          onPress: getBannerPress(b.linkType, b.linkId),
        }))
      : categorySlides;

  function openCategory(categoryId: string, requiresShadeSelection: boolean) {
    if (requiresShadeSelection) {
      navigation.navigate("ShadeSelection", { categoryId });
      return;
    }
    navigation.navigate("ProductList", { categoryId });
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BrandLockup />

        <Pressable
          accessibilityLabel="Open profile"
          onPress={() => navigation.getParent()?.navigate("Profile")}
          style={styles.profileButton}
        >
          <MaterialIcons color={colors.primary} name="person-outline" size={18} />
        </Pressable>
      </View>

      <View style={styles.introBlock}>
        <Text style={styles.introBody}>
          Curated haircare and color essentials with a soft, premium retail experience.
        </Text>
      </View>

      <View style={styles.heroSliderSection}>
        <ScrollView
          contentContainerStyle={styles.heroSliderContent}
          decelerationRate="fast"
          disableIntervalMomentum
          horizontal
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / (slideWidth + spacing.md),
            );
            setActiveHeroIndex(nextIndex);
          }}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={slideWidth + spacing.md}
        >
          {heroSlides.map((slide) => (
            <View key={slide.id} style={[styles.heroSlideWrap, { width: slideWidth }]}>
              <HeroSlide
                body={slide.body}
                buttonLabel={slide.buttonLabel}
                eyebrow={slide.eyebrow}
                imageUrl={slide.imageUrl}
                onPress={slide.onPress}
                title={slide.title}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.heroPagination}>
          {heroSlides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.heroDot,
                index === activeHeroIndex ? styles.heroDotActive : undefined,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.trustStrip}>
        <Text style={styles.trustText}>Premium haircare selected for everyday confidence</Text>
      </View>

      <SectionTitle title="Curated Collections" />

      <View style={styles.categoryList}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => openCategory(category.id, category.requiresShadeSelection)}
            style={styles.categoryCard}
          >
            <View style={styles.categoryCopy}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            </View>

            <CommerceImage
              style={styles.categoryImageFrame}
              uri={category.imageUrl}
            />
          </Pressable>
        ))}
      </View>

      {featuredProducts.length > 0 ? (
        <>
          <SectionTitle actionLabel="View All" title="The Selection" />

          <ScrollView
            contentContainerStyle={styles.productRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {featuredProducts.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
                style={styles.productCard}
              >
                <CommerceImage style={styles.productImage} uri={product.imageUrl} />
                <Text style={styles.productMeta}>{product.subtitle}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text numberOfLines={1} style={styles.productPrice}>
                  THB {product.price.toFixed(0)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}
    </Screen>
  );
}

const cardShadow = {
  shadowColor: "#8A6870",
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  header: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  introBlock: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.sm,
  },
  introBody: {
    color: colors.textSecondary,
    maxWidth: 270,
    ...typography.body,
  },
  heroSliderSection: {
    marginBottom: spacing.xl,
  },
  heroSliderContent: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
  },
  heroSlideWrap: {
    width: "100%",
  },
  heroPagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.borderSoft,
  },
  heroDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  trustStrip: {
    marginHorizontal: spacing["2xl"],
    marginBottom: spacing["3xl"],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  trustText: {
    color: colors.primaryStrong,
    textAlign: "center",
    ...typography.caption,
  },
  categoryList: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing["3xl"],
  },
  categoryCard: {
    minHeight: 118,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    paddingLeft: spacing.xl,
    ...cardShadow,
  },
  categoryCopy: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  categoryTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "500",
  },
  categorySubtitle: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
  },
  categoryImageFrame: {
    width: 132,
    alignSelf: "stretch",
    backgroundColor: colors.surfaceMuted,
  },
  productRow: {
    flexDirection: "row",
    gap: spacing.lg,
    paddingHorizontal: spacing["2xl"],
    marginTop: spacing.lg,
  },
  productCard: {
    width: 176,
    gap: spacing.sm,
  },
  productImage: {
    width: "100%",
    height: 176,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  productMeta: {
    color: colors.textMuted,
    ...typography.caption,
  },
  productName: {
    color: colors.textPrimary,
    minHeight: 44,
    ...typography.body,
  },
  productPrice: {
    color: colors.primaryStrong,
    ...typography.title,
  },
});
