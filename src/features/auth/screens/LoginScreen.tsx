import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { colors, radius, spacing, typography } from "@/theme";

export function LoginScreen() {
  return (
    <Screen>
      <AppHeader
        title="Your beauty ritual begins here"
        subtitle="A clean and premium login flow will be implemented next."
      />
      <View style={styles.card}>
        <View style={styles.input} />
        <View style={styles.input} />
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing["2xl"],
    gap: spacing.lg,
  },
  input: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  button: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
});
