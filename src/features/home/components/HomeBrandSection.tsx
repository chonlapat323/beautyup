import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type Props = {
  horizontalPadding: number;
  onSelectBrand: (brandId: string, brandName: string) => void;
};

export function HomeBrandSection({ horizontalPadding, onSelectBrand }: Props) {
  const brands = useAppStore((state) => state.brands);
  const { width } = useWindowDimensions();

  if (brands.length === 0) return null;

  const cardWidth = width - horizontalPadding * 2 - spacing.lg;

  return (
    <View style={[styles.wrapper, { paddingHorizontal: horizontalPadding }]}>
      <Text style={styles.sectionTitle}>แบรนด์</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + spacing.md}
        snapToAlignment="start"
        contentContainerStyle={styles.scroll}
      >
        {brands.map((brand) => (
          <Pressable
            key={brand.id}
            style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && { opacity: 0.88 }]}
            onPress={() => onSelectBrand(brand.id, brand.name)}
          >
            {brand.imageUrl ? (
              <CommerceImage style={styles.image} uri={brand.imageUrl} contentFit="cover" />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
            {/* Gradient layers — simulate bottom fade */}
            <View style={[styles.gradientLayer, { bottom: 60, height: 40, opacity: 0.15 }]} />
            <View style={[styles.gradientLayer, { bottom: 20, height: 40, opacity: 0.35 }]} />
            <View style={[styles.gradientLayer, { bottom: 0, height: 40, opacity: 0.55 }]} />
            {/* Brand name */}
            <View style={styles.labelArea}>
              <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
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
    height: 160,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
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
  gradientLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#000000",
  },
  labelArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.bold,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
