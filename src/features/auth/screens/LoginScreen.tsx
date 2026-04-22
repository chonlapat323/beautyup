import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLockup } from "@/components/ui/BrandLockup";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileLogin } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const signIn = useAppStore((state) => state.signIn);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!identifier || !password) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setIsLoading(true);
    try {
      const { token } = await mobileLogin(identifier, password);
      signIn(token);
      navigation.popToTop();
    } catch (e) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", e instanceof Error ? e.message : "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.brandBlock}>
        <BrandLockup size="hero" />

        <Text style={styles.title}>Beauty begins with Beauty Up</Text>
        <Text style={styles.subtitle}>
          A refined haircare experience for your daily ritual.
        </Text>
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

        <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={() => void handleLogin()} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "กำลังเข้าสู่ระบบ..." : "Login"}</Text>
        </Pressable>

        <Pressable style={styles.linkRow}>
          <Text style={styles.linkText}>Forgot password</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>สมัครสมาชิก</Text>
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
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    maxWidth: 300,
    fontSize: 18,
    lineHeight: 40,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    maxWidth: 300,
    textAlign: "center",
    ...typography.body,
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
  buttonDisabled: {
    backgroundColor: colors.textMuted,
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
