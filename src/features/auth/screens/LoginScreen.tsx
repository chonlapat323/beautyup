import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppModal } from "@/components/ui/AppModal";
import { BrandLockup } from "@/components/ui/BrandLockup";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileLogin } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing, typography } from "@/theme";

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const signIn = useAppStore((state) => state.signIn);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  async function handleLogin() {
    setFieldError(null);
    if (!identifier.trim()) { setFieldError("กรุณากรอกอีเมลหรือเบอร์โทร"); return; }
    if (!password) { setFieldError("กรุณากรอกรหัสผ่าน"); return; }
    if (password.length < 6) { setFieldError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setIsLoading(true);
    try {
      const { token, member } = await mobileLogin(identifier, password);
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
        title="เข้าสู่ระบบไม่สำเร็จ"
        message={errorModal ?? ""}
        confirmLabel="ตกลง"
        onConfirm={() => setErrorModal(null)}
      />

      {/* ── Brand block — hidden when keyboard is visible ── */}
      {!keyboardVisible && (
        <View style={styles.brandBlock}>
          <BrandLockup size="hero" />
          <Text style={styles.title}>เริ่มต้นความงามไปกับ Beauty Up</Text>
          <Text style={styles.subtitle}>
            ประสบการณ์ดูแลเส้นผมแบบพรีเมียมสำหรับทุกวันของคุณ
          </Text>
        </View>
      )}

      {/* ── Form card ───────────────────────────────────── */}
      <View style={styles.card}>
        {/* Identifier */}
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setIdentifier}
          placeholder="อีเมลหรือเบอร์โทร"
          placeholderTextColor={styles.inputPlaceholder.color}
          style={styles.input}
          value={identifier}
        />

        {/* Password */}
        <View style={styles.passwordRow}>
          <TextInput
            onChangeText={setPassword}
            placeholder="รหัสผ่าน"
            placeholderTextColor={styles.inputPlaceholder.color}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
          />
          <Pressable
            hitSlop={10}
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeBtn}
          >
            <MaterialIcons
              color={colors.textMuted}
              name={showPassword ? "visibility-off" : "visibility"}
              size={20}
            />
          </Pressable>
        </View>

        {/* Field error */}
        {fieldError ? (
          <Text style={styles.fieldError}>{fieldError}</Text>
        ) : null}

        {/* CTA */}
        <Pressable
          disabled={isLoading}
          onPress={() => void handleLogin()}
          style={[styles.button, isLoading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Text>
        </Pressable>

        {/* Forgot password */}
        <Pressable style={styles.forgotRow}>
          <Text style={styles.forgotText}>ลืมรหัสผ่าน</Text>
        </Pressable>

        {/* Register link */}
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

  /* Brand block */
  brandBlock: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["3xl"],
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.semiBold,
    textAlign: "center",
    maxWidth: 280,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    maxWidth: 280,
    textAlign: "center",
    ...typography.body,
  },

  /* Form card — white surface + subtle gold border */
  card: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["2xl"],
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    gap: spacing.lg,
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
  inputPlaceholder: {
    color: "rgba(255,255,255,0.45)" as unknown as string,
  },

  /* Password row */
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: spacing.lg,
    color: "#ffffff",
    ...typography.body,
  },
  eyeBtn: {
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
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

  /* Forgot / footer */
  forgotRow: {
    alignSelf: "center",
    marginTop: -4,
  },
  forgotText: {
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
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
  },
});
