/**
 * ProductListScreen — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • ไม่ใช้ AppHeader — minimal page header เหมือน CartScreen v2
 * • Search bar: pill shape + gold icon wrap (สอดคล้อง AppHeader)
 * • View toggle: gold accent เมื่อ active
 * • Filter chips: active → gold bg + dark text (แทน primary green)
 * • Sort tabs: pill shape, gold active (แทน square green)
 * • GridCard: gold cart button + gold price + subtle gold border
 * • Sale badge: ใช้ primaryDark (#1f5236) pill แทน square
 * • Tab bar: fixed + rounded top (border-top-left/right-radius: 22)
 */

import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";
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
  const bundles = useAppStore((state) => state.bundles);
  const collections = useAppStore((state) => state.collections);

  const { categoryId, bundleId, bundleName, brandId: initialBrandId, collectionId: initialCollectionId } = route.params;

  const [sort, setSort] = useState<SortKey>("all");
  const [search, setSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialBrandId ?? null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categoryId ?? null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(initialCollectionId ?? null);
  const [listView, setListView] = useState(false);

  const baseProducts = useMemo(() => {
    if (!bundleId) return products;
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return products;
    const ids = new Set(bundle.items.map((i) => i.productId));
    return products.filter((p) => ids.has(p.id));
  }, [products, bundles, bundleId]);

  const availableBrands = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of baseProducts) {
      if (p.brandId && p.brandName && !seen.has(p.brandId)) seen.set(p.brandId, p.brandName);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [baseProducts]);

  const availableCategories = useMemo(() => {
    const catIds = new Set(
      baseProducts.filter((p) => !selectedBrandId || p.brandId === selectedBrandId).map((p) => p.categoryId),
    );
    return categories.filter((c) => catIds.has(c.id));
  }, [baseProducts, categories, selectedBrandId]);

  const availableCollections = useMemo(() => {
    const colIds = new Set(
      baseProducts
        .filter((p) => (!selectedBrandId || p.brandId === selectedBrandId) && (!selectedCategoryId || p.categoryId === selectedCategoryId) && p.collectionId)
        .map((p) => p.collectionId!),
    );
    return collections.filter((c) => colIds.has(c.id));
  }, [baseProducts, collections, selectedBrandId, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    let result = baseProducts;
    if (selectedBrandId) result = result.filter((p) => p.brandId === selectedBrandId);
    if (selectedCategoryId) result = result.filter((p) => p.categoryId === selectedCategoryId);
    if (selectedCollectionId) result = result.filter((p) => p.collectionId === selectedCollectionId);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return sortProducts(result, sort);
  }, [baseProducts, selectedBrandId, selectedCategoryId, selectedCollectionId, search, sort]);

  const pageTitle = bundleId
    ? (bundleName ?? "สูตรพิเศษ")
    : selectedCategoryId
    ? (categories.find((c) => c.id === selectedCategoryId)?.title ?? "สินค้า")
    : "สินค้าทั้งหมด";

  return (
    <Screen contentContainerStyle={styles.content}>

      {/* ✦ Minimal page header */}
      <View style={styles.pageHeader}>
        <View style={styles.pageTitleWrap}>
          <Text style={styles.pageTitle}>{pageTitle}</Text>
          <Text style={styles.pageSubtitle}>{bundleId ? "สินค้าในสูตรนี้" : "เลือกสินค้าที่เหมาะกับคุณ"}</Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back-ios" size={12} color={colors.goldDeep} />
          <Text style={styles.backText}>ย้อนกลับ</Text>
        </Pressable>
      </View>

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.bcLink} onPress={() => navigateToHome(navigation)}>หน้าหลัก</Text>
        <Text style={styles.bcSep}>/</Text>
        <Text style={styles.bcCur}>{bundleId ? "สูตรพิเศษ" : "สินค้า"}</Text>
      </View>

      {/* ✦ Search row */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <View style={styles.searchIconWrap}>
            <MaterialIcons name="search" size={16} color={colors.goldDeep} />
          </View>
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
              <MaterialIcons name="close" size={15} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        {/* ✦ View toggle */}
        <Pressable
          style={[styles.viewToggle, listView && styles.viewToggleActive]}
          onPress={() => setListView((v) => !v)}
        >
          <MaterialIcons
            name={listView ? "grid-view" : "view-list"}
            size={20}
            color={listView ? colors.goldDark : "rgba(255,255,255,0.8)"}
          />
        </Pressable>
      </View>

      {/* Brand filter */}
      {!bundleId && availableBrands.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>แบรนด์</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <FilterChip label="ทั้งหมด" active={!selectedBrandId} onPress={() => { setSelectedBrandId(null); setSelectedCategoryId(null); setSelectedCollectionId(null); }} />
            {availableBrands.map((b) => (
              <FilterChip key={b.id} label={b.name} active={selectedBrandId === b.id} onPress={() => { setSelectedBrandId(b.id); setSelectedCategoryId(null); setSelectedCollectionId(null); }} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category filter */}
      {!bundleId && availableCategories.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>หมวดหมู่</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <FilterChip label="ทั้งหมด" active={!selectedCategoryId} onPress={() => { setSelectedCategoryId(null); setSelectedCollectionId(null); }} />
            {availableCategories.map((c) => (
              <FilterChip key={c.id} label={c.title} active={selectedCategoryId === c.id} onPress={() => { setSelectedCategoryId(c.id); setSelectedCollectionId(null); }} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Collection filter */}
      {!bundleId && availableCollections.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>คอลเลกชัน</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <FilterChip label="ทั้งหมด" active={!selectedCollectionId} onPress={() => setSelectedCollectionId(null)} />
            {availableCollections.map((c) => (
              <FilterChip key={c.id} label={c.name} active={selectedCollectionId === c.id} onPress={() => setSelectedCollectionId(c.id)} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ✦ Sort tabs — pill shape */}
      <View style={styles.sortRow}>
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
          <MaterialIcons name="search-off" size={28} color="rgba(255,255,255,0.3)" />
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
            <ListCard key={product.id} product={product} isFavorite={favoriteIds.includes(product.id)}
              onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
              onAddToCart={() => addToCart(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)} />
          ) : (
            <GridCard key={product.id} product={product} isFavorite={favoriteIds.includes(product.id)}
              onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
              onAddToCart={() => addToCart(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)} />
          ),
        )}
      </ScrollView>
    </Screen>
  );
}

// ✦ Reusable filter chip
function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

type CardProps = {
  product: Product; isFavorite: boolean;
  onPress: () => void; onAddToCart: () => void; onToggleFavorite: () => void;
};

function GridCard({ product, isFavorite, onPress, onAddToCart, onToggleFavorite }: CardProps) {
  const isOutOfStock = (product.sellableStock ?? 1) === 0;
  const isLowStock = !isOutOfStock && product.sellableStock != null && product.sellableStock > 0
    && product.sellableStock <= (product.totalStock ?? product.sellableStock) * 0.5;

  return (
    <Pressable onPress={onPress} style={[styles.card, isOutOfStock && styles.cardOutOfStock]}>
      <View style={styles.imageWrap}>
        <CommerceImage style={styles.preview} uri={product.imageUrl} thumbnailUri={product.thumbnailUrl} contentFit="cover" />

        {/* ✦ Sale badge — pill */}
        {product.originalPrice != null && !isOutOfStock && (
          <View style={styles.saleBadge}><Text style={styles.saleBadgeText}>ลดราคา</Text></View>
        )}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}><Text style={styles.outOfStockText}>สินค้าหมด</Text></View>
        )}
        {isLowStock && (
          <View style={styles.lowStockBadge}><Text style={styles.lowStockText}>ใกล้หมด</Text></View>
        )}

        {/* Heart */}
        <Pressable style={styles.heartBtn} onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }} hitSlop={6}>
          <MaterialIcons name={isFavorite ? "favorite" : "favorite-border"} size={14} color={isFavorite ? "#E85C7A" : "#fff"} />
        </Pressable>

        {/* ✦ Gold cart button — disabled when out of stock */}
        <Pressable style={[styles.cartBtn, isOutOfStock && styles.cartBtnDisabled]} onPress={(e) => { e.stopPropagation(); if (!isOutOfStock) onAddToCart(); }} hitSlop={4} disabled={isOutOfStock}>
          <MaterialIcons name="add-shopping-cart" size={15} color={isOutOfStock ? colors.textMuted : colors.goldDark} />
        </Pressable>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardMeta} numberOfLines={1}>{product.subtitle}</Text>
        <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>฿{product.price.toFixed(0)}</Text>
          {product.originalPrice != null && (
            <Text style={styles.origPrice}>฿{product.originalPrice.toFixed(0)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function ListCard({ product, isFavorite, onPress, onAddToCart, onToggleFavorite }: CardProps) {
  const isOutOfStock = (product.sellableStock ?? 1) === 0;
  return (
    <Pressable onPress={onPress} style={[styles.listCard, isOutOfStock && styles.cardOutOfStock]}>
      <View style={styles.listImgWrap}>
        <CommerceImage style={styles.listImg} uri={product.imageUrl} thumbnailUri={product.thumbnailUrl} contentFit="cover" />
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.cardMeta} numberOfLines={1}>{product.brandName ?? product.subtitle}</Text>
        <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>฿{product.price.toFixed(0)}</Text>
          {product.originalPrice != null && !isOutOfStock && <Text style={styles.origPrice}>฿{product.originalPrice.toFixed(0)}</Text>}
          {isOutOfStock && <Text style={styles.outOfStockInline}>สินค้าหมด</Text>}
        </View>
      </View>
      <View style={styles.listActions}>
        <Pressable onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }} style={styles.listActionBtn} hitSlop={6}>
          <MaterialIcons name={isFavorite ? "favorite" : "favorite-border"} size={17} color={isFavorite ? "#E85C7A" : colors.textMuted} />
        </Pressable>
        {/* ✦ Gold cart button — disabled when out of stock */}
        <Pressable onPress={(e) => { e.stopPropagation(); if (!isOutOfStock) onAddToCart(); }} style={[styles.listActionBtn, isOutOfStock ? styles.listCartBtnDisabled : styles.listCartBtn]} hitSlop={6} disabled={isOutOfStock}>
          <MaterialIcons name="add-shopping-cart" size={17} color={isOutOfStock ? colors.textMuted : colors.goldDark} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, backgroundColor: colors.background },

  // Page header
  pageHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  pageTitleWrap: { flex: 1, paddingRight: 12 },
  pageTitle: { color: "#FFFFFF", fontSize: 26, fontFamily: fonts.extraBold, lineHeight: 32 },
  pageSubtitle: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: fonts.medium, marginTop: 3 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingTop: 6 },
  backText: { color: colors.goldDeep, fontSize: 12, fontFamily: fonts.semiBold },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 20, paddingBottom: 12 },
  bcLink: { color: colors.gold, fontSize: 11, fontFamily: fonts.semiBold },
  bcSep: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  bcCur: { color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: fonts.medium },

  // Search
  searchRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 16, marginBottom: 12 },
  searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.goldMuted, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 7, gap: 7 },
  searchIconWrap: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.goldSoft, alignItems: "center", justifyContent: "center" },
  searchInput: { flex: 1, fontSize: 13, fontFamily: fonts.medium, color: colors.textPrimary, padding: 0 },
  viewToggle: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  viewToggleActive: { backgroundColor: colors.gold, borderColor: colors.gold },

  // Filters
  filterSection: { paddingHorizontal: 16, marginBottom: 8 },
  filterLabel: { color: "rgba(255,255,255,0.5)", fontSize: 9, fontFamily: fonts.bold, letterSpacing: 0.9, textTransform: "uppercase", marginBottom: 6 },
  filterRow: { gap: 7 },
  chip: { paddingHorizontal: 13, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.1)" },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: fonts.medium },
  chipTextActive: { color: colors.goldDark, fontFamily: fonts.bold },

  // Sort tabs
  sortRow: { paddingHorizontal: 16, marginBottom: 14, alignItems: "flex-end" },
  sortTabs: { flexDirection: "row", borderRadius: radius.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.07)" },
  sortTab: { paddingHorizontal: 14, paddingVertical: 6 },
  sortTabActive: { backgroundColor: colors.gold },
  sortTabText: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: fonts.medium },
  sortTabTextActive: { color: colors.goldDark, fontFamily: fonts.bold },

  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { color: "rgba(255,255,255,0.55)", fontSize: 14, fontFamily: fonts.medium },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 },
  list: { gap: 10, paddingHorizontal: 16 },

  // Grid card
  card: { width: "47.5%", backgroundColor: colors.surface, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: colors.goldMuted },
  imageWrap: { position: "relative" },
  preview: { width: "100%", aspectRatio: 0.85, backgroundColor: colors.surfaceMuted },
  saleBadge: { position: "absolute", top: 7, left: 7, backgroundColor: colors.primaryDark, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  saleBadgeText: { color: "#fff", fontSize: 9, fontFamily: fonts.bold },
  lowStockBadge: { position: "absolute", bottom: 7, left: 7, backgroundColor: "#3a3a3a", borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  lowStockText: { color: "#e0e0e0", fontSize: 9, fontFamily: fonts.bold },
  outOfStockBadge: { position: "absolute", bottom: 7, left: 7, backgroundColor: "rgba(220,38,38,0.85)", borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  outOfStockText: { color: "#fff", fontSize: 9, fontFamily: fonts.bold },
  outOfStockInline: { color: "#DC2626", fontSize: 11, fontFamily: fonts.bold },
  cardOutOfStock: { opacity: 0.65 },
  cartBtnDisabled: { backgroundColor: colors.surfaceMuted, shadowOpacity: 0, elevation: 0 },
  listCartBtnDisabled: { backgroundColor: colors.surfaceMuted },
  heartBtn: { position: "absolute", top: 7, right: 7, width: 27, height: 27, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.8)", alignItems: "center", justifyContent: "center" },
  // ✦ Gold cart button
  cartBtn: { position: "absolute", bottom: 7, right: 7, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", shadowColor: colors.gold, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardBody: { padding: 10, gap: 3 },
  cardMeta: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.medium },
  cardName: { color: colors.textPrimary, fontSize: 12, fontFamily: fonts.semiBold, lineHeight: 17, minHeight: 34 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 2 },
  price: { color: colors.goldDeep, fontSize: 15, fontFamily: fonts.extraBold },
  origPrice: { color: colors.textMuted, fontSize: 11, textDecorationLine: "line-through", fontFamily: fonts.medium },

  // List card
  listCard: { flexDirection: "row", gap: 12, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.goldMuted, padding: 12, alignItems: "center" },
  listImgWrap: { width: 78, height: 78, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surfaceMuted, flexShrink: 0 },
  listImg: { width: 78, height: 78 },
  listInfo: { flex: 1, gap: 3 },
  listActions: { flexDirection: "column", gap: 8, alignItems: "center", flexShrink: 0 },
  listActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  listCartBtn: { backgroundColor: colors.gold },
});
