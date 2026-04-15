import { StyleSheet, Text, View } from "react-native";

import { BrandLockup } from "@/components/ui/BrandLockup";
import { colors, spacing, typography } from "@/theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <BrandLockup compact />
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
  title: {
    color: colors.textPrimary,
    ...typography.headline,
  },
  subtitle: {
    color: colors.textSecondary,
    ...typography.body,
  },
});
