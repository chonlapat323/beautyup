import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { HomeCategoriesSection } from "@/features/home/components/HomeCategoriesSection";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, spacing } from "@/theme";

const badgeNew = require("../../../slide/new.png") as ReturnType<typeof require>;
const badgeBest = require("../../../slide/best.png") as ReturnType<typeof require>;

function SectionHeader({
  title,
  onViewAll,
  horizontalPadding = 24,
}: {
  title: string;
  onViewAll?: () => void;
  horizontalPadding?: number;
}) {
  return (
    <View style={[sectionStyles.row, { paddingHorizontal: horizontalPadding }]}>
      <Text style={sectionStyles.title}>{title}</Text>
      {onViewAll ? (
        <Pressable hitSlop={8} onPress={onViewAll}>
          <Text style={sectionStyles.link}>View all &gt;</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: "#173022",
  },
  link: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
});

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
  const categoryCardWidth = width < 360 ? 136 : width >= 430 ? 152 : 144;
  const heroHeight = Math.round(width * (width < 380 ? 0.66 : 0.58));
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const heroScrollRef = useRef<ScrollView>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setActiveHeroIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % heroSlides.length;
        heroScrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, 4200);

    return () => clearInterval(intervalId);
  }, [heroSlides.length, width]);

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
        cardWidth={categoryCardWidth}
        horizontalPadding={horizontalPadding}
        onSelectCategory={openCategory}
        onViewAll={() => navigation.navigate("Categories")}
      />

      {heroSlides.length > 0 ? (
        <View style={styles.heroSection}>
          <ScrollView
            contentContainerStyle={styles.heroScrollContent}
            horizontal
            pagingEnabled
            ref={heroScrollRef}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              setActiveHeroIndex(index);
            }}
          >
            {heroSlides.map((banner) => (
              <Pressable
                key={banner.id}
                onPress={() => openBanner(banner.linkType, banner.linkId)}
                style={[styles.heroCard, { width, height: heroHeight }]}
              >
                <View style={styles.heroBackdropLayer}>
                  <CommerceImage
                    resizeMode="cover"
                    style={styles.heroBackdropImage}
                    uri={banner.imageUrl}
                  />
                </View>

                <View style={styles.heroLeftImagePanel}>
                  <CommerceImage
                    resizeMode="cover"
                    style={styles.heroLeftImage}
                    uri={banner.imageUrl}
                  />
                </View>

                <View style={styles.heroRightImagePanel}>
                  <CommerceImage
                    resizeMode="cover"
                    style={styles.heroRightImage}
                    uri={banner.imageUrl}
                  />
                </View>

                <View style={styles.heroOverlay} />

                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>
                    {banner.eyebrow || "Featured edit"}
                  </Text>
                  <Text numberOfLines={2} style={styles.heroTitle}>
                    {banner.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.heroBody}>
                    {banner.body ||
                      "Curated haircare with a softer feel, calm styling, and a premium finish for every day."}
                  </Text>

                  <Pressable style={styles.heroButton}>
                    <Text style={styles.heroButtonText}>
                      {banner.buttonLabel || "Explore"}
                    </Text>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            translateX: pulse.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 4],
                            }),
                          },
                        ],
                      }}
                    >
                      <MaterialIcons
                        color="#FFFFFF"
                        name="arrow-forward"
                        size={14}
                      />
                    </Animated.View>
                  </Pressable>
                </View>

                {banner.tag === "NEW" ? (
                  <Animated.Image
                    resizeMode="contain"
                    source={badgeNew}
                    style={styles.heroBadge}
                  />
                ) : null}

                {banner.tag === "BEST SELLER" ? (
                  <Animated.Image
                    resizeMode="contain"
                    source={badgeBest}
                    style={styles.heroBadge}
                  />
                ) : null}
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.heroDots}>
            {heroSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.heroDot,
                  index === activeHeroIndex && styles.heroDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}

      {featuredProducts.length > 0 ? (
        <>
          <SectionHeader
            horizontalPadding={horizontalPadding}
            onViewAll={() => navigation.navigate("Categories")}
            title="Featured"
          />

          <ScrollView
            contentContainerStyle={[
              styles.productRow,
              { paddingLeft: horizontalPadding, paddingRight: horizontalPadding },
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {featuredProducts.map((product) => (
              <Pressable
                key={product.id}
                onPress={() =>
                  navigation.navigate("ProductDetail", { productId: product.id })
                }
                style={styles.productCard}
              >
                <View style={styles.productImageShell}>
                  <CommerceImage
                    resizeMode="contain"
                    style={styles.productImage}
                    uri={product.imageUrl}
                  />
                  {product.tag === "NEW" ? (
                    <Animated.Image
                      resizeMode="contain"
                      source={badgeNew}
                      style={styles.productBadge}
                    />
                  ) : null}
                  {product.tag === "BEST SELLER" ? (
                    <Animated.Image
                      resizeMode="contain"
                      source={badgeBest}
                      style={styles.productBadge}
                    />
                  ) : null}
                </View>

                <Text numberOfLines={2} style={styles.productName}>
                  {product.name}
                </Text>
                <Text numberOfLines={1} style={styles.productSubtitle}>
                  {product.subtitle}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>
                    THB {product.price.toFixed(0)}
                  </Text>
                  {product.originalPrice ? (
                    <Text style={styles.originalPrice}>
                      THB {product.originalPrice.toFixed(0)}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    addToCart(product.id);
                  }}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>Add to cart</Text>
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        </>
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

  heroSection: {
    marginBottom: spacing["2xl"],
  },
  heroScrollContent: {},
  heroCard: {
    overflow: "hidden",
    backgroundColor: "#dbe8dc",
    position: "relative",
    justifyContent: "flex-end",
  },
  heroBackdropLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBackdropImage: {
    width: "100%",
    height: "100%",
  },
  heroLeftImagePanel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "30%",
    overflow: "hidden",
  },
  heroLeftImage: {
    width: "100%",
    height: "100%",
  },
  heroRightImagePanel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "34%",
    overflow: "hidden",
    opacity: 0.86,
  },
  heroRightImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 52, 34, 0.22)",
  },
  heroCopy: {
    paddingHorizontal: 26,
    paddingVertical: 24,
    width: "76%",
    gap: 8,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.85)",
    fontFamily: fonts.semiBold,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 40,
    color: "#FFFFFF",
    fontFamily: fonts.extraBold,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.88)",
    fontFamily: fonts.medium,
    maxWidth: 210,
  },
  heroButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  heroBadge: {
    width: 70,
    height: 70,
    position: "absolute",
    top: 0,
    right: 0,
  },
  heroDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c8d7cc",
  },
  heroDotActive: {
    width: 24,
    borderRadius: 8,
    backgroundColor: colors.primaryDark,
  },

  productRow: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  productCard: {
    width: 166,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#ebf2ed",
    shadowColor: "#2a5a3d",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  productImageShell: {
    width: "100%",
    height: 176,
    borderRadius: 22,
    backgroundColor: "#f4f8f3",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  productImage: {
    width: "88%",
    height: "88%",
  },
  productBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 52,
    height: 52,
  },
  productName: {
    fontSize: 14,
    lineHeight: 19,
    color: "#193125",
    fontFamily: fonts.bold,
    minHeight: 38,
  },
  productSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: "#7c8f82",
    fontFamily: fonts.medium,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  productPrice: {
    fontSize: 14,
    color: colors.primaryDark,
    fontFamily: fonts.extraBold,
  },
  originalPrice: {
    fontSize: 11,
    color: "#a5b3aa",
    fontFamily: fonts.medium,
    textDecorationLine: "line-through",
  },
  addButton: {
    marginTop: 2,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eef7f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dcebe0",
  },
  addButtonText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontFamily: fonts.bold,
  },
});
