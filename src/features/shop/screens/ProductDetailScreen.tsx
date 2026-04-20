import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ProductDetail">>();
  const addToCart = useAppStore((state) => state.addToCart);
  const product = useAppStore((state) =>
    state.products.find((item) => item.id === route.params.productId),
  );

  if (!product) {
    return null;
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title={product.name} subtitle={product.subtitle} />
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigation.navigate("Home") },
          { label: "Categories", onPress: () => navigation.navigate("Categories") },
          {
            label: "Products",
            onPress: () =>
              navigation.navigate("ProductList", { categoryId: product.categoryId }),
          },
          { label: product.name },
        ]}
      />

      <CommerceImage style={styles.preview} uri={product.imageUrl} />

      <View style={styles.body}>
        <Text style={styles.price}>THB {product.price.toFixed(0)}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>สถานะสินค้า</Text>
            <Text style={styles.infoValue}>พร้อมส่ง</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>ประเภท</Text>
            <Text style={styles.infoValue}>Professional</Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            addToCart(product.id);
            navigation.navigate("Cart");
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>เพิ่มลงตะกร้า</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  preview: {
    marginHorizontal: spacing["2xl"],
    height: 340,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["2xl"],
    gap: spacing.lg,
  },
  price: {
    color: colors.primaryStrong,
    ...typography.headline,
  },
  description: {
    color: colors.textSecondary,
    ...typography.body,
  },
  infoRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  infoCard: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  infoLabel: {
    color: colors.textMuted,
    ...typography.caption,
  },
  infoValue: {
    color: colors.textPrimary,
    ...typography.title,
  },
  button: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
});
