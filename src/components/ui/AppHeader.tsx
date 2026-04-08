import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Beauty Up</Text>
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
  brand: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
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
