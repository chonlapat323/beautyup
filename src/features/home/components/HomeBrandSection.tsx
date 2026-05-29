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

  const cardWidth = width - horizontalPadding * 2 - spacing["2xl"];

  return (
    <View style={[styles.wrapper, { paddingHorizontal: horizontalPadding }]}>
      <Text style={styles.sectionTitle}>แบรนด์</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + spacing.sm}
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
            {/* Text label — bg only behind text, bottom-left */}
            <View style={styles.labelWrap}>
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
    gap: spacing.sm,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
  },
  scroll: {
    gap: spacing.sm,
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
  labelWrap: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});
