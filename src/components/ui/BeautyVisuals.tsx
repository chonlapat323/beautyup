import { PropsWithChildren, Fragment } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import type { CategoryId, Product, Shade } from "@/types/domain";
import { colors, radius } from "@/theme";

type StyledProps = {
  style?: StyleProp<ViewStyle>;
};

type CategoryArtworkProps = StyledProps & {
  categoryId: CategoryId;
};

type ProductArtworkProps = StyledProps & {
  product: Product;
};

type ShadeArtworkProps = PropsWithChildren<StyledProps & {
  shade: Shade;
}>;

const categoryPalettes = {
  "color-bleach": {
    background: "#2F454B",
    secondary: "#7FC4DB",
    tertiary: "#A7D98E",
  },
  "shampoo-mask": {
    background: "#EDE4DD",
    secondary: "#B47459",
    tertiary: "#5C332D",
  },
  "leave-in": {
    background: "#EFE8E1",
    secondary: "#D7A091",
    tertiary: "#8E6170",
  },
} as const;

const productVariantMap: Record<string, "bottle" | "jar" | "tube" | "spray"> = {
  "velvet-hair-oil": "bottle",
  "ceramide-mask": "jar",
  "botanical-wash": "bottle",
  "espresso-color-cream": "tube",
  "honey-blonde-lift": "tube",
  "rose-gold-toner": "jar",
  "chestnut-bleach-care": "tube",
  "silk-finish-mist": "spray",
};

export function RitualArtwork({ style }: StyledProps) {
  return (
    <View style={[styles.ritualVisual, style]}>
      <View style={styles.heroGlow} />
      <View style={styles.heroBottleTall} />
      <View style={styles.heroBottleShort} />
    </View>
  );
}

export function CategoryArtwork({ categoryId, style }: CategoryArtworkProps) {
  const palette = categoryPalettes[categoryId];

  if (categoryId === "color-bleach") {
    return (
      <View style={[styles.categoryShell, { backgroundColor: palette.background }, style]}>
        <View style={[styles.colorOrbLarge, { backgroundColor: palette.tertiary }]} />
        <View style={[styles.colorOrbMedium, { backgroundColor: palette.secondary }]} />
        <View style={[styles.colorOrbSmall, { backgroundColor: "#4AB5F7" }]} />
      </View>
    );
  }

  if (categoryId === "shampoo-mask") {
    return (
      <View style={[styles.categoryShell, { backgroundColor: palette.background }, style]}>
        <View style={[styles.categoryBottle, { backgroundColor: palette.secondary }]} />
        <View style={[styles.categoryJar, { backgroundColor: palette.tertiary }]} />
      </View>
    );
  }

  return (
    <View style={[styles.categoryShell, { backgroundColor: palette.background }, style]}>
      <View style={[styles.leaveBottle, { backgroundColor: palette.secondary }]} />
      <View style={[styles.leaveSprayCap, { backgroundColor: palette.tertiary }]} />
    </View>
  );
}

export function ProductArtwork({ product, style }: ProductArtworkProps) {
  const variant = productVariantMap[product.id] ?? "bottle";

  return (
    <View style={[styles.productShell, { backgroundColor: soften(product.accentColor) }, style]}>
      <View style={styles.productGlow} />
      {variant === "bottle" ? <Bottle color={product.accentColor} /> : null}
      {variant === "jar" ? <Jar color={product.accentColor} /> : null}
      {variant === "tube" ? <Tube color={product.accentColor} /> : null}
      {variant === "spray" ? <Spray color={product.accentColor} /> : null}
    </View>
  );
}

export function ShadeArtwork({ children, shade, style }: ShadeArtworkProps) {
  const bands = [0.92, 0.8, 0.7, 0.56, 0.4, 0.28];

  return (
    <View style={[styles.shadeShell, { backgroundColor: soften(shade.swatch) }, style]}>
      {bands.map((opacity, index) => (
        <Fragment key={opacity}>
          <View
            style={[
              styles.shadeBand,
              {
                backgroundColor: shade.swatch,
                opacity,
                top: 18 + index * 22,
              },
            ]}
          />
        </Fragment>
      ))}
      {children}
    </View>
  );
}

function Bottle({ color }: { color: string }) {
  return (
    <View style={styles.productCenter}>
      <View style={styles.cap} />
      <View style={[styles.bottleBody, { backgroundColor: color }]} />
    </View>
  );
}

function Jar({ color }: { color: string }) {
  return (
    <View style={styles.productCenter}>
      <View style={styles.jarLid} />
      <View style={[styles.jarBody, { backgroundColor: color }]} />
    </View>
  );
}

function Tube({ color }: { color: string }) {
  return (
    <View style={styles.productCenter}>
      <View style={[styles.tubeBody, { backgroundColor: color }]} />
      <View style={styles.tubeCap} />
    </View>
  );
}

function Spray({ color }: { color: string }) {
  return (
    <View style={styles.productCenter}>
      <View style={styles.sprayHead} />
      <View style={[styles.sprayBody, { backgroundColor: color }]} />
    </View>
  );
}

function soften(hex: string) {
  return `${hex}22`;
}

const styles = StyleSheet.create({
  ritualVisual: {
    width: 128,
    minHeight: 196,
    borderRadius: radius.lg,
    backgroundColor: "#F5E8E1",
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: -18,
    right: -10,
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: "#F8EFEA",
  },
  heroBottleTall: {
    width: 70,
    height: 148,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "#C99183",
    marginBottom: 0,
  },
  heroBottleShort: {
    position: "absolute",
    left: 8,
    bottom: 0,
    width: 52,
    height: 96,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: "#E0B7AB",
  },
  categoryShell: {
    flex: 1,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  colorOrbLarge: {
    width: 74,
    height: 74,
    borderRadius: radius.pill,
    position: "absolute",
    left: 12,
  },
  colorOrbMedium: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    position: "absolute",
    right: 18,
    top: 28,
  },
  colorOrbSmall: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    position: "absolute",
    right: 30,
    bottom: 24,
  },
  categoryBottle: {
    width: 42,
    height: 92,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    position: "absolute",
    left: 24,
    bottom: 16,
  },
  categoryJar: {
    width: 54,
    height: 44,
    borderRadius: 18,
    position: "absolute",
    right: 18,
    bottom: 18,
  },
  leaveBottle: {
    width: 42,
    height: 100,
    borderRadius: 16,
    position: "absolute",
    bottom: 16,
  },
  leaveSprayCap: {
    width: 24,
    height: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: "absolute",
    top: 22,
  },
  productShell: {
    overflow: "hidden",
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  productGlow: {
    position: "absolute",
    top: -24,
    right: -10,
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    opacity: 0.55,
  },
  productCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  cap: {
    width: 20,
    height: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "#ECE4E1",
    marginBottom: -2,
    zIndex: 1,
  },
  bottleBody: {
    width: 74,
    height: 124,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  jarLid: {
    width: 82,
    height: 18,
    borderRadius: 12,
    backgroundColor: "#EFE8E6",
    marginBottom: 4,
  },
  jarBody: {
    width: 94,
    height: 66,
    borderRadius: 22,
  },
  tubeBody: {
    width: 82,
    height: 128,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    transform: [{ rotate: "-6deg" }],
  },
  tubeCap: {
    width: 28,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#F1ECE9",
    marginTop: -4,
  },
  sprayHead: {
    width: 28,
    height: 22,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#EFE8E6",
    marginBottom: -2,
    zIndex: 1,
  },
  sprayBody: {
    width: 62,
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  shadeShell: {
    overflow: "hidden",
    position: "relative",
  },
  shadeBand: {
    position: "absolute",
    left: -22,
    right: -22,
    height: 18,
    borderRadius: radius.pill,
    transform: [{ rotate: "-12deg" }],
  },
});
