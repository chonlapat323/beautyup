import { Ionicons } from "@expo/vector-icons";
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
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!identifier.trim()) {
      Alert.alert("กรุณากรอกอีเมลหรือเบอร์โทร");
      return;
    }
    if (!password) {
      Alert.alert("กรุณากรอกรหัสผ่าน");
      return;
    }
    if (password.length < 6) {
      Alert.alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setIsLoading(true);
    try {
      const { token, member } = await mobileLogin(identifier, password);
      signIn(token, member);
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

        <Text style={styles.title}>เริ่มต้นความงามไปกับ Beauty Up</Text>
        <Text style={styles.subtitle}>
          ประสบการณ์ดูแลเส้นผมแบบพรีเมียมสำหรับทุกวันของคุณ
        </Text>
      </View>

      <View style={styles.card}>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setIdentifier}
          placeholder="อีเมลหรือเบอร์โทร"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={identifier}
        />
        <View style={styles.passwordRow}>
          <TextInput
            onChangeText={setPassword}
            placeholder="รหัสผ่าน"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>

        <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={() => void handleLogin()} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</Text>
        </Pressable>

        <Pressable style={styles.linkRow}>
          <Text style={styles.linkText}>ลืมรหัสผ่าน</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>ยังไม่มีบัญชีใช่ไหม?</Text>
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
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    ...typography.body,
  },
  eyeBtn: {
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    height: 56,
    borderRadius: radius.pill,
    // ปุ่มหลัก — ทองคำแท้ เป็นจุดโฟกัสของหน้า Login
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.gold,
    shadowOpacity: 0.40,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
  },
  buttonText: {
    color: colors.goldDark,
    ...typography.title,
    fontWeight: "700",
  },
  linkRow: {
    alignSelf: "center",
  },
  linkText: {
    color: colors.goldDeep,
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
    color: colors.goldDeep,
    ...typography.caption,
    fontWeight: "600",
  },
});
