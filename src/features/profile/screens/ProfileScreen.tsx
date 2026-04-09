import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function ProfileScreen() {
  const signOut = useAppStore((state) => state.signOut);

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader
        title="Profile"
        subtitle="A clean account hub for the Beauty Up mock experience."
      />

      <View style={styles.card}>
        <Text style={styles.name}>Pao Chonlapat</Text>
        <Text style={styles.meta}>Beauty Up Demo Account</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Active orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>THB 1,284</Text>
            <Text style={styles.statLabel}>Total spend</Text>
          </View>
        </View>

        <Pressable onPress={signOut} style={styles.button}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  card: {
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.sm,
  },
  name: {
    color: colors.textPrimary,
    ...typography.headline,
  },
  meta: {
    color: colors.textSecondary,
    ...typography.body,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    ...typography.title,
  },
  statLabel: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  button: {
    marginTop: spacing.lg,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
});
