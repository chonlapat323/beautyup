import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { ProductArtwork } from "@/components/ui/BeautyVisuals";
import { products } from "@/mock/catalog";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ProductDetail">>();
  const addToCart = useAppStore((state) => state.addToCart);
  const product = products.find((item) => item.id === route.params.productId);

  if (!product) {
    return null;
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title={product.name} subtitle={product.subtitle} />

      <ProductArtwork product={product} style={styles.preview} />

      <View style={styles.body}>
        <Text style={styles.price}>THB {product.price.toFixed(0)}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Mock stock status</Text>
            <Text style={styles.infoValue}>Ready to ship</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Finish</Text>
            <Text style={styles.infoValue}>Soft salon glow</Text>
          </View>
        </View>
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Why it belongs in your ritual</Text>
          <Text style={styles.notesBody}>
            Designed for a polished demo flow with premium styling, calm browsing, and easy add-to-cart action.
          </Text>
        </View>
        <Pressable
          onPress={() => {
            addToCart(product.id);
            navigation.navigate("Cart");
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Add to cart</Text>
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
  notesCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  notesTitle: {
    color: colors.textPrimary,
    ...typography.title,
  },
  notesBody: {
    color: colors.textSecondary,
    ...typography.body,
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
