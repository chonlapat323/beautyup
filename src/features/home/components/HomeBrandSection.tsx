import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type Props = {
  horizontalPadding: number;
  onSelectBrand: (brandId: string, brandName: string) => void;
};

export function HomeBrandSection({ horizontalPadding, onSelectBrand }: Props) {
  const brands = useAppStore((state) => state.brands);

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
            {brand.imageUrl ? (
              <CommerceImage
                style={styles.image}
                uri={brand.imageUrl}
                contentFit="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
            {/* Gradient overlay */}
            <View style={styles.overlay} />
            {/* Brand name bottom-left */}
            <View style={styles.labelWrap}>
              <Text style={styles.brandName} numberOfLines={2}>
                {brand.name}
              </Text>
            </View>
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
    width: 160,
    height: 100,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.85,
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imagePlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    backgroundColor: "transparent",
    // gradient-like fade using multiple layers
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    // dark scrim at bottom for text readability
    opacity: 1,
    backgroundImage: undefined,
  },
  labelWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: spacing.lg,
    // dark gradient for readability
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.bold,
    lineHeight: 17,
  },
});
