import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, fonts, radius, spacing, typography } from "@/theme";

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);

  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const trimmed = query.trim().toLowerCase();
  const results = trimmed.length === 0 && selectedCategoryId === null
    ? []
    : products.filter((p) => {
        const matchesQuery = trimmed.length === 0 || p.name.toLowerCase().includes(trimmed);
        const matchesCategory = selectedCategoryId === null || p.categoryId === selectedCategoryId;
        return matchesQuery && matchesCategory;
      });

  const hasFilter = selectedCategoryId !== null;

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.bar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.inputWrap}>
          <MaterialIcons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="ค้นหาสินค้า..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setShowFilter((v) => !v)}
          style={[styles.filterBtn, (showFilter || hasFilter) && styles.filterBtnActive]}
          hitSlop={8}
        >
          <MaterialIcons
            name="tune"
            size={20}
            color={(showFilter || hasFilter) ? "#FFFFFF" : colors.textSecondary}
          />
          {hasFilter ? <View style={styles.filterDot} /> : null}
        </Pressable>
      </View>

      {showFilter ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          <Pressable
            onPress={() => setSelectedCategoryId(null)}
            style={[styles.chip, selectedCategoryId === null && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedCategoryId === null && styles.chipTextActive]}>
              ทั้งหมด
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
              style={[styles.chip, selectedCategoryId === cat.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}>
                {cat.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {trimmed.length === 0 && selectedCategoryId === null ? (
        <View style={styles.hint}>
          <MaterialIcons name="search" size={48} color={colors.borderSoft} />
          <Text style={styles.hintText}>พิมพ์ชื่อสินค้าที่ต้องการ</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.hint}>
          <MaterialIcons name="search-off" size={48} color={colors.borderSoft} />
          <Text style={styles.hintText}>ไม่พบสินค้าที่ตรงกับเงื่อนไข</Text>
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {results.map((product) => (
            <Pressable
              key={product.id}
              style={styles.card}
              onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
            >
              <CommerceImage style={styles.preview} uri={product.imageUrl} />
              <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.price}>THB {product.price.toFixed(0)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: spacing["2xl"],
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    padding: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchIcon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    padding: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E85C7A",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  filterChips: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  hint: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingBottom: 60,
  },
  hintText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.md,
  },
  card: {
    width: "47%",
    gap: spacing.sm,
  },
  preview: {
    width: "100%",
    aspectRatio: 0.85,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  name: {
    color: colors.textPrimary,
    minHeight: 40,
    ...typography.body,
  },
  price: {
    color: colors.primaryStrong,
    ...typography.title,
  },
});
