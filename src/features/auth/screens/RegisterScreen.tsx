import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import type { AuthStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const signIn = useAppStore((state) => state.signIn);
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable accessibilityLabel="Back to login" onPress={() => navigation.goBack()}>
          <MaterialIcons color={colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.brandRow}>
          <MaterialIcons color={colors.primary} name="spa" size={18} />
          <Text style={styles.brandName}>Beauty Up</Text>
        </View>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Start your premium haircare journey with a soft, refined sign-up flow.
        </Text>
      </View>

      <View style={styles.formBlock}>
        <TextInput
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={fullName}
        />
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
        <TextInput
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
        />

        <Pressable style={styles.button} onPress={signIn}>
          <Text style={styles.buttonText}>Create Account</Text>
        </Pressable>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.footerLink}>Login</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  headerRow: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["3xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  brandName: {
    color: colors.primary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "600",
  },
  copyBlock: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["2xl"],
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.textSecondary,
    maxWidth: 280,
    ...typography.body,
  },
  formBlock: {
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
    marginTop: spacing.sm,
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
  footerRow: {
    marginTop: spacing.xl,
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
