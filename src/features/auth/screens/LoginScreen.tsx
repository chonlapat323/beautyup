import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { RitualArtwork } from "@/components/ui/BeautyVisuals";
import type { AuthStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const signIn = useAppStore((state) => state.signIn);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.brandBlock}>
        <View style={styles.brandRow}>
          <MaterialIcons color={colors.primary} name="spa" size={22} />
          <View>
            <Text style={styles.brandName}>Beauty Up</Text>
            <Text style={styles.brandTag}>Beauty Ritual</Text>
          </View>
        </View>

        <Text style={styles.title}>Your beauty ritual begins here</Text>
        <Text style={styles.subtitle}>
          A calm, premium login experience for your daily care essentials.
        </Text>
      </View>

      <View style={styles.heroImage}>
        <RitualArtwork style={styles.ritualArtwork} />
      </View>

      <View style={styles.card}>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setIdentifier}
          placeholder="Phone or email"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={identifier}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        <Pressable style={styles.button} onPress={signIn}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>

        <Pressable style={styles.linkRow}>
          <Text style={styles.linkText}>Forgot password</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>Register</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  brandBlock: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["3xl"],
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  brandName: {
    color: colors.primary,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "600",
  },
  brandTag: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
  },
  title: {
    color: colors.textPrimary,
    maxWidth: 260,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.textSecondary,
    maxWidth: 270,
    ...typography.body,
  },
  heroImage: {
    height: 220,
    marginHorizontal: spacing["2xl"],
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  ritualArtwork: {
    transform: [{ scale: 0.92 }],
  },
  card: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["2xl"],
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.lg,
  },
  input: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    ...typography.body,
  },
  button: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
  linkRow: {
    alignSelf: "center",
  },
  linkText: {
    color: colors.primaryStrong,
    ...typography.caption,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  footerText: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  footerLink: {
    color: colors.primaryStrong,
    ...typography.caption,
  },
});
