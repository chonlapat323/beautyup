import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { ViewStyle } from "react-native";

import { colors, radius, spacing } from "@/theme";

export function SkeletonBox({ style }: { style?: ViewStyle | ViewStyle[] }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return <Animated.View style={[styles.box, style, { opacity }]} />;
}

export function HomeSkeleton() {
  return (
    <View style={styles.homePad}>
      {/* Hero */}
      <SkeletonBox style={styles.heroSlot} />
      {/* Dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <SkeletonBox key={i} style={i === 0 ? styles.dotActive : styles.dot} />
        ))}
      </View>
      {/* Trust strip */}
      <SkeletonBox style={styles.trustStrip} />
      {/* Section title */}
      <SkeletonBox style={styles.sectionTitle} />
      {/* Category cards */}
      {[0, 1, 2].map((i) => (
        <SkeletonBox key={i} style={styles.categoryCard} />
      ))}
      {/* Section title 2 */}
      <SkeletonBox style={[styles.sectionTitle, { marginTop: spacing.xl }]} />
      {/* Product row */}
      <View style={styles.productRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.productCard}>
            <SkeletonBox style={styles.productImage} />
            <SkeletonBox style={styles.productMeta} />
            <SkeletonBox style={styles.productName} />
            <SkeletonBox style={styles.productPrice} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function CategoriesListSkeleton() {
  return (
    <View style={styles.listPad}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonBox key={i} style={styles.categoryCard} />
      ))}
    </View>
  );
}

export function ProductGridSkeleton() {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.gridCard}>
          <SkeletonBox style={styles.gridImage} />
          <SkeletonBox style={styles.gridMeta} />
          <SkeletonBox style={styles.gridName} />
          <SkeletonBox style={styles.gridPrice} />
        </View>
      ))}
    </View>
  );
}

export function OrderListSkeleton() {
  return (
    <View style={styles.listPad}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.orderCard}>
          <View style={styles.orderRow}>
            <SkeletonBox style={styles.orderIdSkeleton} />
            <SkeletonBox style={styles.orderPill} />
          </View>
          <SkeletonBox style={styles.orderMeta} />
          <SkeletonBox style={styles.orderDate} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
  },

  // Home
  homePad: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  heroSlot: {
    height: 220,
    borderRadius: radius.lg,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24, height: 8, borderRadius: 4 },
  trustStrip: {
    height: 52,
    borderRadius: radius.lg,
    marginVertical: spacing.sm,
  },
  sectionTitle: { height: 20, width: 160, borderRadius: 4 },
  categoryCard: { height: 126, borderRadius: radius.lg },
  productRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  productCard: { width: 160, gap: spacing.sm },
  productImage: { width: 160, height: 160, borderRadius: radius.md },
  productMeta: { height: 10, width: 80, borderRadius: 4 },
  productName: { height: 14, borderRadius: 4 },
  productPrice: { height: 14, width: 60, borderRadius: 4 },

  // Lists shared
  listPad: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
  },

  // Product grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    paddingHorizontal: spacing["2xl"],
  },
  gridCard: { width: "47%", gap: spacing.sm },
  gridImage: { width: "100%", aspectRatio: 0.85, borderRadius: radius.md },
  gridMeta: { height: 10, width: "55%", borderRadius: 4 },
  gridName: { height: 14, borderRadius: 4 },
  gridPrice: { height: 14, width: "40%", borderRadius: 4 },

  // Order list
  orderCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdSkeleton: { height: 16, width: 130, borderRadius: 4 },
  orderPill: { height: 26, width: 64, borderRadius: radius.pill },
  orderMeta: { height: 13, width: "60%", borderRadius: 4 },
  orderDate: { height: 11, width: "35%", borderRadius: 4 },
});
