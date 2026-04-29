import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { navigateToCategories, navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";
import type { Product } from "@/types/domain";

type SortKey = "all" | "sale" | "newest";

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "newest", label: "มาใหม่" },
  { key: "sale", label: "ลดราคา" },
];

function sortProducts(products: Product[], sort: SortKey): Product[] {
  if (sort === "sale") return products.filter((p) => p.originalPrice != null);
  if (sort === "newest") return [...products].reverse();
  return products;
}

export function ProductListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ProductList">>();
  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const isLoading = useAppStore((state) => state.isLoadingCatalog);

  const addToCart = useAppStore((state) => state.addToCart);
  const favoriteIds = useAppStore((state) => state.favoriteIds);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const { categoryId, shadeId, shadeName } = route.params;
  const category = categories.find((item) => item.id === categoryId);
  const [sort, setSort] = useState<SortKey>("all");

  const filteredProducts = products.filter(
    (item) =>
      item.categoryId === categoryId &&
      (shadeId ? item.shadeId === shadeId : true),
  );
  const displayProducts = sortProducts(filteredProducts, sort);

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title={category?.title ?? "สินค้า"}
          subtitle={shadeName ? `เฉดสี: ${shadeName}` : "เลือกสินค้าที่เหมาะกับคุณ"}
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "หมวดหมู่สินค้า", onPress: () => navigateToCategories(navigation) },
            shadeName
              ? {
                  label: "เลือกเฉดสี",
                  onPress: () => navigation.navigate("ShadeSelection", { categoryId }),
                }
              : null,
            { label: "สินค้า" },
          ].filter(Boolean) as { label: string; onPress?: () => void }[]}
        />
      }
    >
      <View style={styles.toolbar}>
        {shadeName ? (
          <View style={styles.filterPill}>
            <Text style={styles.filterText}>{shadeName}</Text>
          </View>
        ) : <View />}

        <View style={styles.sortTabs}>
          {SORT_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setSort(tab.key)}
              style={[styles.sortTab, sort === tab.key && styles.sortTabActive]}
            >
              <Text style={[styles.sortTabText, sort === tab.key && styles.sortTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : displayProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {sort === "sale" ? "ยังไม่มีสินค้าลดราคา" : "ไม่พบสินค้าในหมวดหมู่นี้"}
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {displayProducts.map((product) => (
          <Pressable
            key={product.id}
            onPress={() =>
              navigation.navigate("ProductDetail", {
                productId: product.id,
                shadeName: shadeName,
              })
            }
            style={styles.card}
          >
            <View style={styles.imageWrap}>
              <CommerceImage style={styles.preview} uri={product.imageUrl} />
              {product.originalPrice != null ? (
                <View style={styles.saleBadge}>
                  <Text style={styles.saleBadgeText}>Sale</Text>
                </View>
              ) : null}
              <Pressable
                style={styles.favoriteBtn}
                onPress={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                hitSlop={4}
              >
                <MaterialIcons
                  name={favoriteIds.includes(product.id) ? "favorite" : "favorite-border"}
                  size={15}
                  color={favoriteIds.includes(product.id) ? "#E85C7A" : "#FFFFFF"}
                />
              </Pressable>
              <Pressable
                style={styles.cartBtn}
                onPress={(e) => { e.stopPropagation(); addToCart(product.id); }}
                hitSlop={4}
              >
                <MaterialIcons name="add-shopping-cart" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.meta}>{product.subtitle}</Text>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>THB {product.price.toFixed(0)}</Text>
              {product.originalPrice != null ? (
                <Text style={styles.originalPrice}>THB {product.originalPrice.toFixed(0)}</Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["2xl"],
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  filterPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  filterText: {
    color: colors.primaryStrong,
    ...typography.caption,
  },
  sortTabs: {
    flexDirection: "row",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  sortTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  sortTabActive: {
    backgroundColor: colors.primary,
  },
  sortTabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  sortTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    paddingHorizontal: spacing["2xl"],
  },
  card: {
    width: "47%",
    gap: spacing.sm,
  },
  imageWrap: {
    position: "relative",
  },
  preview: {
    width: "100%",
    aspectRatio: 0.85,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  saleBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  saleBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  favoriteBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtn: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  meta: {
    color: colors.textMuted,
    ...typography.caption,
  },
  name: {
    color: colors.textPrimary,
    minHeight: 44,
    ...typography.body,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  price: {
    color: colors.primaryStrong,
    ...typography.title,
  },
  originalPrice: {
    color: colors.textMuted,
    fontSize: 12,
    textDecorationLine: "line-through",
  },
});
