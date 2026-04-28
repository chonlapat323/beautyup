import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function ProductListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ProductList">>();
  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const isLoading = useAppStore((state) => state.isLoadingCatalog);

  const { categoryId, shadeId, shadeName } = route.params;
  const category = categories.find((item) => item.id === categoryId);

  const filteredProducts = products.filter(
    (item) =>
      item.categoryId === categoryId &&
      (shadeId ? item.shadeId === shadeId : true),
  );

  return (
    <Screen contentContainerStyle={styles.content} header={<AppHeader title={category?.title ?? "สินค้า"} subtitle={shadeName ? `เฉดสี: ${shadeName}` : "เลือกสินค้า"} />}>
      <Breadcrumbs
        items={
          shadeName
            ? [
                { label: "Home", onPress: () => navigation.navigate("Home") },
                { label: "Categories", onPress: () => navigation.navigate("Categories") },
                {
                  label: category?.title ?? "สินค้า",
                  onPress: () => navigation.navigate("Categories"),
                },
                {
                  label: shadeName,
                  onPress: () => navigation.navigate("ShadeSelection", { categoryId }),
                },
                { label: "สินค้า" },
              ]
            : [
                { label: "Home", onPress: () => navigation.navigate("Home") },
                { label: "Categories", onPress: () => navigation.navigate("Categories") },
                {
                  label: category?.title ?? "สินค้า",
                  onPress: () => navigation.navigate("Categories"),
                },
                { label: "สินค้า" },
              ]
        }
      />

      {shadeName ? (
        <View style={styles.filterPill}>
          <Text style={styles.filterText}>{shadeName}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <ProductGridSkeleton />
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
