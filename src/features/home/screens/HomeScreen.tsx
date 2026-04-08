import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { categories } from "@/mock/categories";
import { colors, radius, spacing, typography } from "@/theme";

export function HomeScreen() {
  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader
        title="For your daily beauty ritual"
        subtitle="Premium beauty and haircare essentials, curated for mobile-first commerce."
      />

      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Spring Ritual</Text>
        <Text style={styles.heroTitle}>Care That Feels Premium</Text>
        <Text style={styles.heroBody}>
          Professional beauty essentials curated for soft shine, healthy texture, and everyday confidence.
        </Text>
        <Pressable style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Shop Now</Text>
        </Pressable>
      </View>

      <SectionTitle title="Curated Collections" />

      <View style={styles.categoryList}>
        {categories.map((category) => (
          <Pressable key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryCopy}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            </View>
            <View style={styles.categoryPreview} />
          </Pressable>
        ))}
      </View>

      <SectionTitle actionLabel="View All" title="The Selection" />

      <View style={styles.productRow}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.productCard}>
            <View style={styles.productImage} />
            <Text style={styles.productMeta}>Hydrate</Text>
            <Text style={styles.productName}>Velvet Hair Oil</Text>
            <Text style={styles.productPrice}>THB 42.00</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  heroCard: {
    marginHorizontal: spacing["2xl"],
    marginBottom: spacing["3xl"],
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
  },
  heroTitle: {
    color: colors.textPrimary,
    maxWidth: 220,
    ...typography.headline,
  },
  heroBody: {
    color: colors.textSecondary,
    maxWidth: 260,
    ...typography.body,
  },
  heroButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  heroButtonText: {
    color: "#FFFFFF",
    ...typography.caption,
  },
  categoryList: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing["3xl"],
  },
  categoryCard: {
    height: 128,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: spacing.xl,
  },
  categoryCopy: {
    gap: spacing.sm,
    paddingRight: spacing.md,
    flex: 1,
  },
  categoryTitle: {
    color: colors.textPrimary,
    ...typography.title,
  },
  categorySubtitle: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
  },
  categoryPreview: {
    width: 112,
    alignSelf: "stretch",
    backgroundColor: colors.surfaceMuted,
  },
  productRow: {
    flexDirection: "row",
    gap: spacing.lg,
    paddingHorizontal: spacing["2xl"],
    marginTop: spacing.lg,
  },
  productCard: {
    width: 176,
    gap: spacing.sm,
  },
  productImage: {
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  productMeta: {
    color: colors.textMuted,
    ...typography.caption,
  },
  productName: {
    color: colors.textPrimary,
    ...typography.body,
  },
  productPrice: {
    color: colors.primaryStrong,
    ...typography.title,
  },
});
