import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { colors, radius, spacing, typography } from "@/theme";

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  return (
    <Screen>
      <AppHeader title={title} subtitle={subtitle} />
      <View style={styles.card}>
        <Text style={styles.label}>Coming next</Text>
        <Text style={styles.text}>
          This screen is scaffolded and ready for the approved UI implementation.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing.md,
    padding: spacing["2xl"],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.md,
  },
  label: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
  },
  text: {
    color: colors.textSecondary,
    ...typography.body,
  },
});
