/**
 * SearchScreen — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • Back button: วงกลม semi-transparent แทน plain arrow
 * • Search bar: pill + gold icon wrap (สอดคล้องทุกหน้า)
 * • Empty state (ยังไม่พิมพ์):
 *   - icon วงกลม + ข้อความแนะนำ
 *   - "ค้นหายอดนิยม" chips (gold) + "หมวดหมู่" chips
 *   → ใช้พื้นที่ให้คุ้ม ไม่ blank
 * • Results header: gold pill แสดงจำนวนผลลัพธ์ + label ขวา
 * • Product cards: สอดคล้องกับ ProductListScreen v2
 *   - gold border, gold price, heart btn, gold cart btn
 * • Tab bar: fixed + rounded top
 */

import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import {
  FlatList, Pressable, StyleSheet, Text,
  TextInput, View,
} from "react-native";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import type { Product } from "@/types/domain";
import { colors, fonts, radius, spacing } from "@/theme";

// ── Popular search terms (static fallback) ────────────────
const STATIC_POPULAR = ["ORDEVE", "Koleston", "Illumina", "ELUJUDA", "Shinefinity"];

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);
  const brands = useAppStore((s) => s.brands);
  const favoriteIds = useAppStore((s) => s.favoriteIds);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const addToCart = useAppStore((s) => s.addToCart);

  // Popular terms: brand names from store
  const popularTerms = brands.length > 0
    ? brands.slice(0, 5).map((b) => b.name)
    : STATIC_POPULAR;

  // Category chips: real categories from store (max 4)
  const categoryChips = categories.slice(0, 4);

  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const results = trimmed.length === 0
    ? []
    : products.filter((p) =>
        p.name.toLowerCase().includes(trimmed) ||
        p.subtitle?.toLowerCase().includes(trimmed) ||
        p.brandName?.toLowerCase().includes(trimmed),
      );

  const applySearch = useCallback((term: string) => setQuery(term), []);

  // ── Grid card ───────────────────────────────────────────
  function renderItem({ item }: { item: Product }) {
    const isFav = favoriteIds.includes(item.id);
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
      >
        <View style={styles.imageWrap}>
          <CommerceImage style={styles.image} uri={item.imageUrl} contentFit="cover" />

          {/* Heart */}
          <Pressable
            style={styles.heartBtn}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={6}
          >
            <MaterialIcons
              name={isFav ? "favorite" : "favorite-border"}
              size={13}
              color={isFav ? "#E85C7A" : "#fff"}
            />
          </Pressable>

          {/* Sale badge */}
          {item.originalPrice != null && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>ลดราคา</Text>
            </View>
          )}

          {/* ✦ Gold cart button */}
          <Pressable
            style={styles.cartBtn}
            onPress={() => addToCart(item.id)}
            hitSlop={4}
          >
            <MaterialIcons name="add-shopping-cart" size={14} color={colors.goldDark} />
          </Pressable>
        </View>

        <View style={styles.cardBody}>
          {item.subtitle ? (
            <Text style={styles.cardMeta} numberOfLines={1}>{item.subtitle}</Text>
          ) : null}
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>฿{item.price.toFixed(0)}</Text>
            {item.originalPrice != null && (
              <Text style={styles.origPrice}>฿{item.originalPrice.toFixed(0)}</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  // ── Empty / suggestion state ────────────────────────────
  const EmptyState = trimmed.length > 0 ? (
    // ไม่พบผลลัพธ์
    <View style={styles.notFound}>
      <MaterialIcons name="search-off" size={40} color="rgba(255,255,255,0.25)" />
      <Text style={styles.notFoundText}>ไม่พบสินค้าที่ตรงกับ "{query}"</Text>
      <Text style={styles.notFoundSub}>ลองใช้คำค้นหาอื่น หรือเรียกดูตามหมวดหมู่</Text>
    </View>
  ) : (
    // ยังไม่พิมพ์ — suggestions
    <View style={styles.suggestions}>
      <View style={styles.suggestHero}>
        <View style={styles.suggestIcon}>
          <MaterialIcons name="search" size={26} color="rgba(255,255,255,0.3)" />
        </View>
        <Text style={styles.suggestTitle}>ค้นหาสินค้าที่ต้องการ</Text>
        <Text style={styles.suggestSub}>พิมพ์ชื่อสินค้า แบรนด์ หรือเฉดสี</Text>
      </View>

      {/* ✦ Popular searches — brand names */}
      <Text style={styles.suggestLabel}>แบรนด์ยอดนิยม</Text>
      <View style={styles.chipRow}>
        {popularTerms.map((term) => (
          <Pressable key={term} style={styles.chipGold} onPress={() => applySearch(term)}>
            <MaterialIcons name="local-fire-department" size={12} color={colors.gold} />
            <Text style={styles.chipGoldText}>{term}</Text>
          </Pressable>
        ))}
      </View>

      {/* Category shortcuts — real categories */}
      {categoryChips.length > 0 && (
        <>
          <Text style={[styles.suggestLabel, { marginTop: 14 }]}>หมวดหมู่</Text>
          <View style={styles.chipRow}>
            {categoryChips.map((cat) => (
              <Pressable
                key={cat.id}
                style={styles.chip}
                onPress={() => navigation.navigate("ProductList", { categoryId: cat.id })}
              >
                <MaterialIcons name="category" size={13} color="rgba(255,255,255,0.65)" />
                <Text style={styles.chipText}>{cat.title}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <Screen scrollable={false} contentContainerStyle={styles.screen}>

      {/* ✦ Search bar */}
      <View style={styles.searchBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={18} color="#fff" />
        </Pressable>
        <View style={styles.inputWrap}>
          <View style={styles.searchIconWrap}>
            <MaterialIcons name="search" size={15} color={colors.goldDeep} />
          </View>
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="ค้นหาสินค้า..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8} style={styles.clearBtn}>
              <MaterialIcons name="close" size={13} color="#6b7280" />
            </Pressable>
          )}
        </View>
      </View>

      {/* ✦ Results counter (แสดงเมื่อมีผลลัพธ์) */}
      {trimmed.length > 0 && results.length > 0 && (
        <View style={styles.resultsBar}>
          <View style={styles.resultsPill}>
            <MaterialIcons name="inventory-2" size={11} color={colors.gold} />
            <Text style={styles.resultsCount}>{results.length} รายการ</Text>
          </View>
          <Text style={styles.resultsLabel}>ผลการค้นหา</Text>
        </View>
      )}

      {/* ✦ FlatList — grid หรือ empty/suggestion */}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={results.length > 0 ? styles.row : undefined}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={EmptyState}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // Search bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  inputWrap: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 8, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.goldMuted,
    gap: 7,
  },
  searchIconWrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.goldSoft,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1, fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    padding: 0,
  },
  clearBtn: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#e5e7eb",
    alignItems: "center", justifyContent: "center",
  },

  // Results bar
  resultsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  resultsPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.goldSoft,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.3)",
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
  },
  resultsCount: { color: colors.gold, fontSize: 11, fontFamily: fonts.bold },
  resultsLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: fonts.medium },

  // FlatList
  listContent: { paddingHorizontal: 13, paddingBottom: 80 },
  listEmpty: { flexGrow: 1 },
  row: { justifyContent: "space-between", marginBottom: 10 },

  // Grid card — เหมือน ProductListScreen v2
  card: {
    width: "48.5%",
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.goldMuted,
  },
  imageWrap: { position: "relative", aspectRatio: 0.85, backgroundColor: colors.surfaceMuted },
  image: { width: "100%", height: "100%" },
  heartBtn: {
    position: "absolute", top: 7, left: 7,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center", justifyContent: "center",
  },
  saleBadge: {
    position: "absolute", top: 7, right: 7,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  saleBadgeText: { color: "#fff", fontSize: 8, fontFamily: fonts.bold },
  cartBtn: {
    position: "absolute", bottom: 7, right: 7,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.gold,
    alignItems: "center", justifyContent: "center",
    shadowColor: colors.gold, shadowOpacity: 0.3,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  cardBody: { padding: 9, gap: 3 },
  cardMeta: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.medium },
  cardName: { color: colors.textPrimary, fontSize: 11, fontFamily: fonts.semiBold, lineHeight: 16, minHeight: 32 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 2 },
  price: { color: colors.goldDeep, fontSize: 14, fontFamily: fonts.extraBold },
  origPrice: { color: colors.textMuted, fontSize: 10, textDecorationLine: "line-through", fontFamily: fonts.medium },

  // Not found
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 40 },
  notFoundText: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: fonts.semiBold, textAlign: "center" },
  notFoundSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: fonts.medium, textAlign: "center" },

  // Suggestions (empty state)
  suggestions: { paddingTop: 20, paddingBottom: 20, gap: 10 },
  suggestHero: { alignItems: "center", gap: 6, marginBottom: 8 },
  suggestIcon: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.13)",
    alignItems: "center", justifyContent: "center",
  },
  suggestTitle: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: fonts.bold },
  suggestSub: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: fonts.medium },
  suggestLabel: {
    color: "rgba(255,255,255,0.5)", fontSize: 9,
    fontFamily: fonts.bold, letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  // ✦ Popular — gold chip
  chipGold: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill, borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipGoldText: { color: colors.gold, fontSize: 11, fontFamily: fonts.bold },
  // Category chip
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: radius.pill, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { color: "rgba(255,255,255,0.78)", fontSize: 11, fontFamily: fonts.medium },
});
