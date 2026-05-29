import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type Props = {
  horizontalPadding: number;
  onSelectBrand: (brandId: string, brandName: string) => void;
};

export function HomeBrandSection({ horizontalPadding, onSelectBrand }: Props) {
  const products = useAppStore((state) => state.products);

  const brands = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) {
      if (p.brandId && p.brandName && !seen.has(p.brandId)) {
        seen.set(p.brandId, p.brandName);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  if (brands.length === 0) return null;

  return (
    <View style={[styles.wrapper, { paddingHorizontal: horizontalPadding }]}>
      <Text style={styles.sectionTitle}>แบรนด์</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {brands.map((brand) => (
          <Pressable
            key={brand.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => onSelectBrand(brand.id, brand.name)}
          >
            <Text style={styles.brandName} numberOfLines={2}>{brand.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing["2xl"],
    gap: spacing.md,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
  },
  scroll: {
    gap: spacing.md,
    paddingRight: spacing.sm,
  },
  card: {
    width: 140,
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.gold,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.75,
  },
  brandName: {
    color: colors.primaryStrong,
    fontSize: 15,
    fontFamily: fonts.bold,
    textAlign: "center",
    lineHeight: 20,
  },
});
