import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLockup } from "@/components/ui/BrandLockup";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileRegister } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const signIn = useAppStore((state) => state.signIn);

  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !identifier || !password) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setIsLoading(true);
    try {
      const { token, member } = await mobileRegister(fullName, identifier, password, referralCode || undefined);
      signIn(token, member);
      navigation.popToTop();
    } catch (e) {
      Alert.alert("สมัครสมาชิกไม่สำเร็จ", e instanceof Error ? e.message : "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable accessibilityLabel="Back to login" onPress={() => navigation.goBack()}>
          <MaterialIcons color={colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <BrandLockup compact />
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
        <TextInput
          autoCapitalize="none"
          onChangeText={setReferralCode}
          placeholder="Referral code (optional)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={referralCode}
        />

        <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={() => void handleRegister()} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "กำลังสมัครสมาชิก..." : "Create Account"}</Text>
        </Pressable>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.footerLink}>เข้าสู่ระบบ</Text>
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
  buttonDisabled: {
    backgroundColor: colors.textMuted,
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
