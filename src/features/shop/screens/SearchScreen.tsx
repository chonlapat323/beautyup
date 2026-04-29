import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import type { Product } from "@/types/domain";
import { colors, fonts, radius, spacing, typography } from "@/theme";

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const products = useAppStore((s) => s.products);
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const results = trimmed.length === 0
    ? []
    : products.filter((p) => p.name.toLowerCase().includes(trimmed));

  function renderItem({ item }: { item: Product }) {
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
      >
        <CommerceImage style={styles.image} uri={item.imageUrl} />
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>THB {item.price.toFixed(0)}</Text>
      </Pressable>
    );
  }

  return (
    <Screen scrollable={false}>
      <View style={styles.bar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.inputWrap}>
          <MaterialIcons name="search" size={18} color={colors.textMuted} />
          <TextInput
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
      </View>

      <FlatList
        style={styles.list}
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent, results.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons
              name={trimmed.length === 0 ? "search" : "search-off"}
              size={48}
              color={colors.borderSoft}
            />
            <Text style={styles.emptyText}>
              {trimmed.length === 0 ? "พิมพ์ชื่อสินค้าที่ต้องการ" : "ไม่พบสินค้าที่ตรงกับเงื่อนไข"}
            </Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
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
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    padding: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  listEmpty: {
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  card: {
    width: "47%",
    gap: spacing.xs,
  },
  image: {
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
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
