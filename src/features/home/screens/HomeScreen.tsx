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
import { CommerceImage } from "@/components/ui/CommerceImage";
import { PointsPill } from "@/components/ui/PointsPill";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, spacing } from "@/theme";

const badgeNew = require("../../../slide/new.png") as ReturnType<typeof require>;
const badgeBest = require("../../../slide/best.png") as ReturnType<typeof require>;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "สวัสดีตอนเช้า";
  if (hour < 17) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}

function SectionHeader({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <View style={sectionStyles.row}>
      <Text style={sectionStyles.title}>{title}</Text>
      {onViewAll ? (
        <Pressable hitSlop={8} onPress={onViewAll}>
          <Text style={sectionStyles.link}>ดูทั้งหมด &gt;</Text>
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
    paddingHorizontal: 24,
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
  const member = useAppStore((state) => state.member);
  const addToCart = useAppStore((state) => state.addToCart);
  const loadCatalog = useAppStore((state) => state.loadCatalog);

  const initials = member?.fullName?.trim().charAt(0).toUpperCase() ?? "P";
  const featuredProducts = (
    products.filter((product) => product.isFeatured).length > 0
      ? products.filter((product) => product.isFeatured)
      : products
  ).slice(0, 8);
  const heroSlides = (banners.length > 0 ? banners : []).slice(0, 4);

  const heroWidth = width;
  const heroHeight = Math.round(width * 0.58);
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
          x: nextIndex * heroWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 4200);

    return () => clearInterval(intervalId);
  }, [heroSlides.length, heroWidth]);

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

  const homeHeader = (
    <View style={styles.header}>
      <View style={styles.profileGroup}>
        <View style={styles.avatarShell}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text numberOfLines={1} style={styles.memberName}>
            {member?.fullName ?? "Pao"}
          </Text>
        </View>
      </View>
      <PointsPill />
    </View>
  );

  if (isLoading) {
    return (
      <Screen header={homeHeader} contentContainerStyle={styles.content}>
        <HomeSkeleton />
      </Screen>
    );
  }

  return (
    <Screen header={homeHeader} contentContainerStyle={styles.content} onRefresh={loadCatalog}>
      <Pressable
        onPress={() => navigation.navigate("Search")}
        style={styles.searchBar}
      >
        <View style={styles.searchIconWrap}>
          <MaterialIcons name="search" size={18} color="#567260" />
        </View>
        <Text style={styles.searchPlaceholder}>ค้นหาผลิตภัณฑ์ดูแลเส้นผม</Text>
      </Pressable>

      {categories.length > 0 ? (
        <>
          <SectionHeader
            onViewAll={() => navigation.navigate("Categories")}
            title="หมวดหมู่สินค้า"
          />

          <ScrollView
            contentContainerStyle={styles.categoryRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.slice(0, 6).map((category) => (
              <Pressable
                key={category.id}
                onPress={() =>
                  openCategory(category.id, category.requiresShadeSelection)
                }
                style={styles.categoryCard}
              >
                <View style={styles.categoryVisual}>
                  <View style={styles.categoryGlow} />
                  <View style={styles.categoryIconWrap}>
                    <CommerceImage
                      resizeMode="cover"
                      style={styles.categoryIcon}
                      uri={category.imageUrl}
                    />
                  </View>
                </View>
                <Text numberOfLines={2} style={styles.categoryLabel}>
                  {category.title}
                </Text>
                <Text numberOfLines={1} style={styles.categoryCaption}>
                  {category.requiresShadeSelection ? "เลือกเฉดก่อน" : "พร้อมช้อป"}
                </Text>
              </Pressable>
            ))}
            <View style={styles.rowTrail} />
          </ScrollView>
        </>
      ) : null}

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
                event.nativeEvent.contentOffset.x / heroWidth,
              );
              setActiveHeroIndex(index);
            }}
          >
            {heroSlides.map((banner) => (
              <Pressable
                key={banner.id}
                onPress={() => openBanner(banner.linkType, banner.linkId)}
                style={[styles.heroCard, { width: heroWidth, height: heroHeight }]}
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
                    {banner.eyebrow || "คอลเลกชันแนะนำ"}
                  </Text>
                  <Text numberOfLines={2} style={styles.heroTitle}>
                    {banner.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.heroBody}>
                    {banner.body ||
                      "คัดสรรผลิตภัณฑ์ดูแลเส้นผมที่ให้สัมผัสนุ่ม ละมุน และดูพรีเมียมในทุกวัน"}
                  </Text>

                  <Pressable style={styles.heroButton}>
                    <Text style={styles.heroButtonText}>
                      {banner.buttonLabel || "เลือกชม"}
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
            onViewAll={() => navigation.navigate("Categories")}
            title="สินค้าแนะนำ"
          />

          <ScrollView
            contentContainerStyle={styles.productRow}
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
                  <Text style={styles.addButtonText}>เพิ่มลงตะกร้า</Text>
                </Pressable>
              </Pressable>
            ))}
            <View style={styles.rowTrail} />
          </ScrollView>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 44,
    backgroundColor: "#fbfefb",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 40, 25, 0.06)",
    shadowColor: "#1f5236",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  profileGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  avatarShell: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#edf7ef",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dbeadd",
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1f5236",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  profileCopy: {
    gap: 2,
    flex: 1,
    paddingTop: 4,
  },
  greeting: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: "#7d8d82",
  },
  memberName: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fonts.extraBold,
    color: "#163222",
  },

  searchBar: {
    marginHorizontal: 24,
    marginBottom: 22,
    borderRadius: 28,
    backgroundColor: "#f1f8f2",
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#deece1",
    shadowColor: "#2b563c",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  searchIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e4f0e7",
    alignItems: "center",
    justifyContent: "center",
  },
  searchPlaceholder: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#6d8a78",
  },

  categoryRow: {
    paddingLeft: 24,
    gap: 12,
    paddingBottom: 24,
  },
  categoryCard: {
    width: 122,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8f1ea",
    gap: 10,
    shadowColor: "#2c5a3c",
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  categoryVisual: {
    width: "100%",
    height: 108,
    borderRadius: 22,
    backgroundColor: "#eff7f1",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  categoryGlow: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#d9ebdd",
    opacity: 0.85,
  },
  categoryIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe9df",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  categoryLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: "#203628",
    fontFamily: fonts.semiBold,
  },
  categoryCaption: {
    fontSize: 11,
    lineHeight: 14,
    color: "#6d8677",
    fontFamily: fonts.medium,
  },

  heroSection: {
    marginBottom: spacing["2xl"],
  },
  heroScrollContent: {
  },
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
    paddingLeft: spacing["2xl"],
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  rowTrail: {
    width: 24,
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
