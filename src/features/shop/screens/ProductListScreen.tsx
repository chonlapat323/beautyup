import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { shades } from "@/mock/catalog";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function ProductListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ProductList">>();
  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);

  const isLoading = useAppStore((state) => state.isLoadingCatalog);
  const category = categories.find((item) => item.id === route.params.categoryId);
  const selectedShade = shades.find((item) => item.id === route.params.shadeId);
  const filteredProducts = products.filter((item) => item.categoryId === route.params.categoryId);

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader
        title={category?.title ?? "Products"}
        subtitle={selectedShade ? `Selected shade: ${selectedShade.name}` : "Browse products"}
      />
      <Breadcrumbs
        items={
          selectedShade
            ? [
                { label: "Home", onPress: () => navigation.navigate("Home") },
                { label: "Categories", onPress: () => navigation.navigate("Categories") },
                {
                  label: category?.title ?? "Products",
                  onPress: () => navigation.navigate("Categories"),
                },
                {
                  label: selectedShade.name,
                  onPress: () =>
                    navigation.navigate("ShadeSelection", { categoryId: route.params.categoryId }),
                },
                { label: "Products" },
              ]
            : [
                { label: "Home", onPress: () => navigation.navigate("Home") },
                { label: "Categories", onPress: () => navigation.navigate("Categories") },
                {
                  label: category?.title ?? "Products",
                  onPress: () => navigation.navigate("Categories"),
                },
                { label: "Products" },
              ]
        }
      />

      {selectedShade ? (
        <View style={styles.filterPill}>
          <View style={[styles.filterSwatch, { backgroundColor: selectedShade.swatch }]} />
          <Text style={styles.filterText}>{selectedShade.name}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing["3xl"] }} />
      ) : filteredProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>ไม่พบสินค้าในหมวดหมู่นี้</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {filteredProducts.map((product) => (
          <Pressable
            key={product.id}
            onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
            style={styles.card}
          >
            <CommerceImage style={styles.preview} uri={product.imageUrl} />
            <Text style={styles.meta}>{product.subtitle}</Text>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>THB {product.price.toFixed(0)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["2xl"],
  },
  filterPill: {
    marginHorizontal: spacing["2xl"],
    marginBottom: spacing.xl,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  filterSwatch: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
  },
  filterText: {
    color: colors.primaryStrong,
    ...typography.caption,
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
  preview: {
    width: "100%",
    aspectRatio: 0.85,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
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
  price: {
    color: colors.primaryStrong,
    ...typography.title,
  },
});
