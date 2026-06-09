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
import { colors, fonts, radius, spacing, typography } from "@/theme";

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
    <Screen contentContainerStyle={styles.content} noTabOffset>
      <AppModal
        visible={errorModal !== null}
        type="error"
        title="สมัครสมาชิกไม่สำเร็จ"
        message={errorModal ?? ""}
        confirmLabel="ตกลง"
        onConfirm={() => setErrorModal(null)}
      />

      {/* ── Header row ──────────────────────────────────── */}
      <View style={styles.headerRow}>
        <Pressable
          accessibilityLabel="กลับไปหน้าเข้าสู่ระบบ"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialIcons color={"#ffffff"} name="arrow-back" size={20} />
        </Pressable>
        <View style={styles.logoWrap}>
          <BrandLockup compact />
        </View>
      </View>

      {/* ── Copy block ──────────────────────────────────── */}
      <View style={styles.copyBlock}>
        <Text style={styles.title}>สร้างบัญชีของคุณ</Text>
        <Text style={styles.subtitle}>
          เริ่มต้นประสบการณ์ดูแลเส้นผมแบบพรีเมียม{"\n"}
          ด้วยการสมัครสมาชิกที่เรียบง่าย
        </Text>
      </View>

      {/* ── Form card ───────────────────────────────────── */}
      <View style={styles.card}>

        {/* Required fields */}
        <TextInput
          onChangeText={setFullName}
          placeholder="ชื่อ-นามสกุล"
          placeholderTextColor={PLACEHOLDER}
          style={styles.input}
          value={fullName}
        />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={PLACEHOLDER}
          style={styles.input}
          value={email}
        />
        <TextInput
          keyboardType="phone-pad"
          onChangeText={setPhone}
          placeholder="เบอร์โทรศัพท์"
          placeholderTextColor={PLACEHOLDER}
          style={styles.input}
          value={phone}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="รหัสผ่าน"
          placeholderTextColor={PLACEHOLDER}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <TextInput
          onChangeText={setConfirmPassword}
          placeholder="ยืนยันรหัสผ่าน"
          placeholderTextColor={PLACEHOLDER}
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
        />

        {/* ── Optional divider ─────────────────────────── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ไม่บังคับ</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Optional fields — 2 col */}
        <View style={styles.optionalRow}>
          <TextInput
            autoCapitalize="none"
            onChangeText={setReferralCode}
            placeholder="รหัสแนะนำ"
            placeholderTextColor={PLACEHOLDER}
            style={[styles.input, styles.inputOpt]}
            value={referralCode}
          />
          <TextInput
            autoCapitalize="characters"
            onChangeText={setSalonCode}
            placeholder="รหัสซาลอน"
            placeholderTextColor={PLACEHOLDER}
            style={[styles.input, styles.inputOpt]}
            value={salonCode}
          />
        </View>

        {/* Field error */}
        {fieldError ? (
          <Text style={styles.fieldError}>{fieldError}</Text>
        ) : null}

        {/* Gold CTA */}
        <Pressable
          disabled={isLoading}
          onPress={() => void handleRegister()}
          style={[styles.button, isLoading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </Text>
        </Pressable>

        {/* Login link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>มีบัญชีอยู่แล้วใช่ไหม?</Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>เข้าสู่ระบบ</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

/** Placeholder color for jade-bg inputs */
const PLACEHOLDER = "rgba(255,255,255,0.45)";

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },

  /* Header row */
  headerRow: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["3xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    borderRadius: 999,
    backgroundColor: colors.surface,
    padding: 8,
  },

  /* Copy block */
  copyBlock: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["2xl"],
    gap: spacing.sm,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.bold,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    maxWidth: 280,
    ...typography.body,
    lineHeight: 22,
  },

  /* Form card */
  card: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["2xl"],
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    gap: spacing.md,
  },

  /* Input */
  input: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: spacing.lg,
    color: "#ffffff",
    ...typography.body,
  },

  /* Optional 2-col layout */
  optionalRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inputOpt: {
    flex: 1,
    borderStyle: "dashed",
    borderColor: colors.goldMuted,
  },

  /* Section divider */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.goldMuted,
  },
  dividerText: {
    color: colors.goldDeep,
    fontSize: 11,
    fontFamily: fonts.medium,
    letterSpacing: 0.5,
  },

  /* Field error */
  fieldError: {
    color: "#f87171",
    fontSize: 12,
    paddingHorizontal: 4,
    marginTop: -4,
  },

  /* Gold CTA button */
  button: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.goldDark,
    fontSize: 18,
    fontFamily: fonts.bold,
  },

  /* Footer */
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
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
  },
});
