import { StyleSheet, Text, View } from "react-native";

import { BrandLockup } from "@/components/ui/BrandLockup";
import { PointsPill } from "@/components/ui/PointsPill";
import { colors, fonts, spacing, typography } from "@/theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <BrandLockup compact />
        <PointsPill />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    ...typography.headline,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    ...typography.body,
  },
});
