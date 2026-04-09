import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage, CommerceImageBackground } from "@/components/ui/CommerceImage";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { categories, products } from "@/mock/catalog";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const featuredProducts = products.slice(0, 4);
  const heroProduct = products.find((item) => item.id === "ceramide-mask") ?? featuredProducts[0];

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
        <View style={styles.brandRow}>
          <MaterialIcons color={colors.primary} name="spa" size={20} />
          <View>
            <Text style={styles.brandName}>Beauty Up</Text>
            <Text style={styles.brandTag}>Beauty Ritual</Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Open profile"
          onPress={() => navigation.getParent()?.navigate("Profile")}
          style={styles.profileButton}
        >
          <MaterialIcons color={colors.primary} name="person-outline" size={18} />
        </Pressable>
      </View>

      <View style={styles.introBlock}>
        <Text style={styles.introTitle}>For your daily beauty ritual</Text>
        <Text style={styles.introBody}>
          Curated haircare and color essentials with a soft, premium retail experience.
        </Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Spring Ritual</Text>
          <Text style={styles.heroTitle}>Care That Feels Premium</Text>
          <Text style={styles.heroBody}>
            Professional beauty essentials curated for soft shine, healthy texture, and everyday
            confidence.
          </Text>
          <Pressable style={styles.heroButton} onPress={() => navigation.navigate("Categories")}>
            <Text style={styles.heroButtonText}>Shop Now</Text>
          </Pressable>
        </View>

        <CommerceImageBackground
          imageStyle={styles.heroVisualImage}
          style={styles.heroVisual}
          uri={heroProduct?.imageUrl}
        />
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  brandName: {
    color: colors.primary,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "600",
  },
  brandTag: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
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
  introTitle: {
    color: colors.textPrimary,
    maxWidth: 260,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "600",
  },
  introBody: {
    color: colors.textSecondary,
    maxWidth: 270,
    ...typography.body,
  },
  heroCard: {
    marginHorizontal: spacing["2xl"],
    marginBottom: spacing.xl,
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flexDirection: "row",
    overflow: "hidden",
    ...cardShadow,
  },
  heroCopy: {
    flex: 1,
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
  },
  heroTitle: {
    color: colors.textPrimary,
    maxWidth: 180,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "600",
  },
  heroBody: {
    color: colors.textSecondary,
    ...typography.body,
  },
  heroButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  heroButtonText: {
    color: "#FFFFFF",
    ...typography.caption,
  },
  heroVisual: {
    width: 128,
  },
  heroVisualImage: {
    borderRadius: radius.lg,
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
