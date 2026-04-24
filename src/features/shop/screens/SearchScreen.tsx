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

  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const trimmed = query.trim().toLowerCase();
  const results = trimmed.length === 0
    ? []
    : products.filter((p) => p.name.toLowerCase().includes(trimmed));

  return (
    <Screen contentContainerStyle={styles.content}>
      {/* ── Search bar row ─────────────────────────────────────── */}
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
      </View>

      {/* ── Results ────────────────────────────────────────────── */}
      {trimmed.length === 0 ? (
        <View style={styles.hint}>
          <MaterialIcons name="search" size={48} color={colors.borderSoft} />
          <Text style={styles.hintText}>พิมพ์ชื่อสินค้าที่ต้องการ</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.hint}>
          <MaterialIcons name="search-off" size={48} color={colors.borderSoft} />
          <Text style={styles.hintText}>ไม่พบสินค้าที่ตรงกับ "{query}"</Text>
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
