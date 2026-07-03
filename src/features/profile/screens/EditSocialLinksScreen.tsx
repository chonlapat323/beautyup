import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileUpdateSocialLinks } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";
import { navigateToHome, navigateToProfileHome } from "@/navigation/helpers";

const FIELDS: { key: "facebook" | "tiktok" | "shopee" | "lazada"; label: string; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  { key: "shopee", label: "Shopee", placeholder: "https://shopee.co.th/yourshop" },
  { key: "lazada", label: "Lazada", placeholder: "https://lazada.co.th/shop/yourshop" },
];

export function EditSocialLinksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((s) => s.token);
  const member = useAppStore((s) => s.member);
  const refreshProfile = useAppStore((s) => s.refreshProfile);

  const [form, setForm] = useState({
    facebook: member?.facebook ?? "",
    tiktok: member?.tiktok ?? "",
    shopee: member?.shopee ?? "",
    lazada: member?.lazada ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!token) return;
    setError(null);
    setIsSaving(true);
    try {
      await mobileUpdateSocialLinks(token, {
        facebook: form.facebook.trim() || null,
        tiktok: form.tiktok.trim() || null,
        shopee: form.shopee.trim() || null,
        lazada: form.lazada.trim() || null,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => navigation.goBack(), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader
        title="ช่องทางติดต่อ"
        breadcrumbs={[
          { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
          { label: "บัญชีของฉัน", onPress: () => navigateToProfileHome(navigation) },
          { label: "ช่องทางติดต่อ" },
        ]}
      />

      <View style={styles.card}>
        <Text style={styles.hint}>ลิงก์ร้านค้าหรือโซเชียลมีเดียของคุณ (ถ้ามี)</Text>
        {FIELDS.map(({ key, label, placeholder }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={form[key] ?? ""}
              onChangeText={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saved ? <Text style={styles.success}>บันทึกสำเร็จ ✓</Text> : null}

      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>ยกเลิก</Text>
        </Pressable>
        <Pressable
          style={[styles.saveBtn, isSaving && styles.btnDisabled]}
          onPress={() => void handleSave()}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>{isSaving ? "กำลังบันทึก..." : "บันทึก"}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, paddingBottom: spacing["3xl"] },
  card: {
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.md,
  },
  hint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  field: { gap: spacing.xs },
  label: { color: colors.textSecondary, ...typography.caption, fontWeight: "500" },
  input: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    color: "#ffffff",
    ...typography.body,
  },
  error: { color: "#dc2626", fontSize: 12, marginHorizontal: spacing["2xl"], marginTop: spacing.sm },
  success: { color: "#16a34a", fontSize: 13, textAlign: "center", marginTop: spacing.sm },
  actions: {
    flexDirection: "row",
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["2xl"],
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: colors.textSecondary, ...typography.title },
  saveBtn: {
    flex: 2,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { backgroundColor: colors.textMuted },
  saveText: { color: "#fff", ...typography.title },
});
