import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileRequestWithdrawal } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function WithdrawalScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((s) => s.token);
  const member = useAppStore((s) => s.member);
  const refreshProfile = useAppStore((s) => s.refreshProfile);

  const creditBalance = member?.creditBalance ?? 0;
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError("กรุณากรอกจำนวนที่ถูกต้อง"); return; }
    if (num > creditBalance) { setError("ยอด Credit ไม่เพียงพอ"); return; }
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      await mobileRequestWithdrawal(token, num);
      await refreshProfile();
      setSuccess(true);
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="ถอน Credit"
          subtitle="ส่งคำขอถอน credit ไปยัง admin"
          breadcrumbs={[
            { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
            { label: "ถอน Credit" },
          ]}
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Credit คงเหลือ</Text>
          <Text style={styles.balanceAmount}>
            ฿{creditBalance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>ส่งคำขอแล้ว</Text>
            <Text style={styles.successBody}>
              Admin จะตรวจสอบและดำเนินการภายใน 1-3 วันทำการ
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate("CreditHistory")}
            >
              <Text style={styles.primaryButtonText}>ดูประวัติการถอน</Text>
            </Pressable>
            <Pressable style={styles.outlineButton} onPress={() => navigation.goBack()}>
              <Text style={styles.outlineButtonText}>กลับ</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.label}>จำนวนที่ต้องการถอน (บาท)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={(v) => { setAmount(v); setError(null); }}
              keyboardType="numeric"
              placeholder="เช่น 500"
              placeholderTextColor={colors.textMuted}
            />

            <Pressable
              style={styles.maxBtn}
              onPress={() => setAmount(String(creditBalance))}
            >
              <Text style={styles.maxBtnText}>ถอนทั้งหมด ฿{creditBalance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={() => void handleSubmit()}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.primaryButtonText}>ส่งคำขอถอน</Text>
              }
            </Pressable>

            <Text style={styles.note}>
              * คำขอจะถูกส่งให้ admin ตรวจสอบ credit จะถูกหักทันที และจะคืนหากถูกปฏิเสธ
            </Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  card: {
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.md,
  },
  balanceBox: {
    borderRadius: radius.md,
    backgroundColor: "#F0FAF4",
    borderWidth: 1,
    borderColor: "#B7DDC7",
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  balanceAmount: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  label: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: "600",
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  maxBtn: {
    alignSelf: "flex-start",
  },
  maxBtnText: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: "600",
  },
  errorText: {
    color: "#c84b44",
    ...typography.caption,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
  outlineButton: {
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: colors.textSecondary,
    ...typography.title,
  },
  note: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  successBox: {
    gap: spacing.md,
    alignItems: "center",
  },
  successTitle: {
    color: colors.primary,
    ...typography.headline,
  },
  successBody: {
    color: colors.textSecondary,
    ...typography.body,
    textAlign: "center",
  },
});
