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
            style={({ pressed }) => [styles.slide, { width: cardWidth }, pressed && { opacity: 0.85 }]}
            onPress={() => onSelectBrand(brand.id, brand.name)}
          >
            <View style={styles.imageWrap}>
              {brand.imageUrl ? (
                <CommerceImage style={styles.image} uri={brand.imageUrl} contentFit="cover" />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
            </View>
            <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
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
    gap: spacing.md,
    paddingRight: spacing.sm,
  },
  slide: {
    gap: spacing.sm,
  },
  imageWrap: {
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
    flex: 1,
    backgroundColor: colors.surface,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});
