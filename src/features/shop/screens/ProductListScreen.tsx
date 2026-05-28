import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  const [search, setSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [listView, setListView] = useState(false);

  const categoryProducts = useMemo(
    () =>
      products.filter(
        (item) =>
          item.categoryId === categoryId &&
          (shadeId ? item.shadeId === shadeId : true),
      ),
    [products, categoryId, shadeId],
  );

  const brands = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of categoryProducts) {
      if (p.brandId && p.brandName && !seen.has(p.brandId)) {
        seen.set(p.brandId, p.brandName);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [categoryProducts]);

  const filteredProducts = useMemo(() => {
    let result = sortProducts(categoryProducts, sort);
    if (selectedBrandId) result = result.filter((p) => p.brandId === selectedBrandId);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [categoryProducts, sort, selectedBrandId, search]);

  function toggleBrand(id: string) {
    setSelectedBrandId((prev) => (prev === id ? null : id));
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title={category?.title ?? "สินค้า"}
          subtitle={shadeName ? `เฉดสี: ${shadeName}` : "เลือกสินค้าที่เหมาะกับคุณ"}
          breadcrumbs={[
            { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
            { label: "หมวดหมู่สินค้า", onPress: () => navigateToCategories(navigation) },
            shadeName
              ? {
                  label: "เลือกเฉดสี",
                  onPress: () => navigation.navigate("ShadeSelection", { categoryId }),
                }
              : null,
            { label: "สินค้า" },
          ].filter(Boolean) as { label: string; onPress?: () => void }[]}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {/* Search row */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาสินค้า..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={6}>
              <MaterialIcons name="close" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable style={styles.viewToggle} onPress={() => setListView((v) => !v)}>
          <MaterialIcons
            name={listView ? "grid-view" : "view-list"}
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Brand slider */}
      {brands.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandSlider}
        >
          {brands.map((brand) => (
            <Pressable
              key={brand.id}
              style={[styles.brandPill, selectedBrandId === brand.id && styles.brandPillActive]}
              onPress={() => toggleBrand(brand.id)}
            >
              <Text
                style={[styles.brandPillText, selectedBrandId === brand.id && styles.brandPillTextActive]}
              >
                {brand.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Sort + shade row */}
      <View style={styles.toolbar}>
        {shadeName ? (
          <View style={styles.filterPill}>
            <Text style={styles.filterText}>{shadeName}</Text>
          </View>
        ) : (
          <View />
        )}
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
      ) : filteredProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {sort === "sale" ? "ยังไม่มีสินค้าลดราคา" : search ? "ไม่พบสินค้าที่ค้นหา" : "ไม่พบสินค้าในหมวดหมู่นี้"}
          </Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={listView ? styles.list : styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.map((product) =>
          listView ? (
            <ListCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.includes(product.id)}
              onPress={() => navigation.navigate("ProductDetail", { productId: product.id, shadeName })}
              onAddToCart={() => addToCart(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
            />
          ) : (
            <GridCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.includes(product.id)}
              onPress={() => navigation.navigate("ProductDetail", { productId: product.id, shadeName })}
              onAddToCart={() => addToCart(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
            />
          ),
        )}
      </ScrollView>
    </Screen>
  );
}

type CardProps = {
  product: Product;
  isFavorite: boolean;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
};

function GridCard({ product, isFavorite, onPress, onAddToCart, onToggleFavorite }: CardProps) {
  const isLowStock =
    product.sellableStock != null &&
    product.sellableStock > 0 &&
    product.sellableStock <= (product.totalStock ?? product.sellableStock) * 0.5;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <CommerceImage style={styles.preview} uri={product.imageUrl} />
        {product.originalPrice != null && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>ลดราคา</Text>
          </View>
        )}
        {isLowStock && (
          <>
            <View style={styles.lowStockOverlay} />
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>ใกล้หมด</Text>
            </View>
          </>
        )}
        <Pressable
          style={styles.favoriteBtn}
          onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          hitSlop={4}
        >
          <MaterialIcons
            name={isFavorite ? "favorite" : "favorite-border"}
            size={15}
            color={isFavorite ? "#E85C7A" : "#FFFFFF"}
          />
        </Pressable>
        <Pressable
          style={styles.cartBtn}
          onPress={(e) => { e.stopPropagation(); onAddToCart(); }}
          hitSlop={4}
        >
          <MaterialIcons name="add-shopping-cart" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
      <Text style={styles.meta} numberOfLines={1}>{product.subtitle}</Text>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>฿{product.price.toFixed(0)}</Text>
        {product.originalPrice != null && (
          <Text style={styles.originalPrice}>฿{product.originalPrice.toFixed(0)}</Text>
        )}
      </View>
    </Pressable>
  );
}

function ListCard({ product, isFavorite, onPress, onAddToCart, onToggleFavorite }: CardProps) {
  const isLowStock =
    product.sellableStock != null &&
    product.sellableStock > 0 &&
    product.sellableStock <= (product.totalStock ?? product.sellableStock) * 0.5;

  return (
    <Pressable onPress={onPress} style={styles.listCard}>
      <View style={styles.listImageWrap}>
        <CommerceImage style={styles.listImage} uri={product.imageUrl} />
        {isLowStock && (
          <>
            <View style={styles.lowStockOverlay} />
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>ใกล้หมด</Text>
            </View>
          </>
        )}
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.meta} numberOfLines={1}>{product.brandName ?? product.subtitle}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>฿{product.price.toFixed(0)}</Text>
          {product.originalPrice != null && (
            <Text style={styles.originalPrice}>฿{product.originalPrice.toFixed(0)}</Text>
          )}
        </View>
        {product.originalPrice != null && (
          <View style={[styles.saleBadge, styles.listSaleBadge]}>
            <Text style={styles.saleBadgeText}>ลดราคา</Text>
          </View>
        )}
      </View>
      <View style={styles.listActions}>
        <Pressable
          onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          hitSlop={6}
          style={styles.listActionBtn}
        >
          <MaterialIcons
            name={isFavorite ? "favorite" : "favorite-border"}
            size={18}
            color={isFavorite ? "#E85C7A" : colors.textMuted}
          />
        </Pressable>
        <Pressable
          onPress={(e) => { e.stopPropagation(); onAddToCart(); }}
          hitSlop={6}
          style={[styles.listActionBtn, styles.listCartBtn]}
        >
          <MaterialIcons name="add-shopping-cart" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing["2xl"],
    marginBottom: spacing.md,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    padding: 0,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  brandSlider: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  brandPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  brandPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  brandPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  brandPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
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
  list: {
    gap: spacing.md,
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
  listSaleBadge: {
    position: "relative",
    top: 0,
    left: 0,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
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
    flexWrap: "wrap",
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
  lowStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30,30,30,0.22)",
    borderRadius: radius.md,
  },
  lowStockBadge: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: "#3a3a3a",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  lowStockText: {
    color: "#e0e0e0",
    fontSize: 10,
    fontWeight: "700",
  },
  listCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    alignItems: "center",
  },
  listImageWrap: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    flexShrink: 0,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  listInfo: {
    flex: 1,
    gap: 2,
  },
  listActions: {
    flexDirection: "column",
    gap: spacing.sm,
    alignItems: "center",
    flexShrink: 0,
  },
  listActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  listCartBtn: {
    backgroundColor: colors.primary,
  },
});
