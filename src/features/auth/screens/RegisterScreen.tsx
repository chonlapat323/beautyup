import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppModal } from "@/components/ui/AppModal";

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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [salonCode, setSalonCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  async function handleRegister() {
    setFieldError(null);
    if (!fullName.trim()) { setFieldError("กรุณากรอกชื่อ-นามสกุล"); return; }
    if (!email.trim() && !phone.trim()) { setFieldError("กรุณากรอกอีเมลหรือเบอร์โทรอย่างน้อย 1 อย่าง"); return; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setFieldError("รูปแบบอีเมลไม่ถูกต้อง"); return; }
    if (phone.trim() && !/^\d{10}$/.test(phone.trim())) { setFieldError("เบอร์โทรต้องเป็นตัวเลข 10 หลัก"); return; }
    if (!password) { setFieldError("กรุณากรอกรหัสผ่าน"); return; }
    if (password.length < 6) { setFieldError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (password !== confirmPassword) { setFieldError("รหัสผ่านไม่ตรงกัน"); return; }
    setIsLoading(true);
    try {
      const { token, member } = await mobileRegister(fullName, email, phone, password, referralCode || undefined, salonCode || undefined);
      signIn(token, member);
      navigation.popToTop();
    } catch (e) {
      setErrorModal(e instanceof Error ? e.message : "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppModal
        visible={errorModal !== null}
        type="error"
        title="สมัครสมาชิกไม่สำเร็จ"
        message={errorModal ?? ""}
        confirmLabel="ตกลง"
        onConfirm={() => setErrorModal(null)}
      />
      <View style={styles.headerRow}>
        <Pressable accessibilityLabel="กลับไปหน้าเข้าสู่ระบบ" onPress={() => navigation.goBack()}>
          <MaterialIcons color={colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <BrandLockup compact />
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.title}>สร้างบัญชีของคุณ</Text>
        <Text style={styles.subtitle}>
          เริ่มต้นประสบการณ์ดูแลเส้นผมแบบพรีเมียมด้วยการสมัครสมาชิกที่เรียบง่าย
        </Text>
      </View>

      <View style={styles.formBlock}>
        <TextInput
          onChangeText={setFullName}
          placeholder="ชื่อ-นามสกุล"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={fullName}
        />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={email}
        />
        <TextInput
          keyboardType="phone-pad"
          onChangeText={setPhone}
          placeholder="เบอร์โทรศัพท์"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={phone}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="รหัสผ่าน"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <TextInput
          onChangeText={setConfirmPassword}
          placeholder="ยืนยันรหัสผ่าน"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
        />
        <TextInput
          autoCapitalize="none"
          onChangeText={setReferralCode}
          placeholder="รหัสแนะนำ (ถ้ามี)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={referralCode}
        />
        <TextInput
          autoCapitalize="characters"
          onChangeText={setSalonCode}
          placeholder="รหัสซาลอน (ถ้ามี)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={salonCode}
        />

        {fieldError ? <Text style={styles.fieldError}>{fieldError}</Text> : null}
        <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={() => void handleRegister()} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}</Text>
        </Pressable>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>มีบัญชีอยู่แล้วใช่ไหม?</Text>
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
  fieldError: { color: "#dc2626", fontSize: 12, marginBottom: 8, paddingHorizontal: 4 },
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
