import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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
  const hasSavedBank = !!(member?.bankName && member.bankAccountNumber && member.bankAccountName);

  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError("กรุณากรอกจำนวนที่ถูกต้อง"); return; }
    if (num > creditBalance) { setError("ยอดเครดิตไม่เพียงพอ"); return; }
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      await mobileRequestWithdrawal(token, {
        amount: num,
        bankName: member!.bankName!,
        bankAccountNumber: member!.bankAccountNumber!,
        bankAccountName: member!.bankAccountName!,
      });
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
          title="ถอนเครดิต"
          subtitle="ส่งคำขอถอนเครดิตไปยังแอดมิน"
          breadcrumbs={[
            { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
            { label: "ถอนเครดิต" },
          ]}
        />
      }
    >
      <View style={styles.card}>
        {/* Balance */}
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>เครดิตคงเหลือ</Text>
          <Text style={styles.balanceAmount}>
            ฿{creditBalance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {success ? (
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>ส่งคำขอแล้ว</Text>
            <Text style={styles.successBody}>
              แอดมินจะตรวจสอบและดำเนินการภายใน 1–3 วันทำการ
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("CreditHistory")}>
              <Text style={styles.primaryButtonText}>ดูประวัติการถอน</Text>
            </Pressable>
            <Pressable style={styles.outlineButton} onPress={() => navigation.goBack()}>
              <Text style={styles.outlineButtonText}>กลับ</Text>
            </Pressable>
          </View>
        ) : !hasSavedBank ? (
          /* No bank account saved — redirect to BankAccount screen */
          <View style={styles.noBankBox}>
            <Text style={styles.noBankTitle}>ยังไม่มีบัญชีธนาคาร</Text>
            <Text style={styles.noBankBody}>
              กรุณาเพิ่มบัญชีธนาคารก่อนทำการถอนเครดิต
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("BankAccount")}>
              <Text style={styles.primaryButtonText}>เพิ่มบัญชีธนาคาร</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Amount */}
            <Text style={styles.label}>จำนวนที่ต้องการถอน (บาท)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={(v) => { setAmount(v); setError(null); }}
              keyboardType="numeric"
              placeholder="เช่น 500"
              placeholderTextColor={colors.textMuted}
            />
            <Pressable style={styles.maxBtn} onPress={() => setAmount(String(creditBalance))}>
              <Text style={styles.maxBtnText}>
                ถอนทั้งหมด ฿{creditBalance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </Text>
            </Pressable>

            <View style={styles.divider} />

            {/* Saved bank (read-only) */}
            <View style={styles.bankSectionHeader}>
              <Text style={styles.sectionLabel}>บัญชีที่ต้องการรับเงิน</Text>
              <Pressable onPress={() => navigation.navigate("BankAccount")}>
                <Text style={styles.changeBtn}>เปลี่ยนบัญชี</Text>
              </Pressable>
            </View>
            <View style={styles.savedBankCard}>
              <Text style={styles.savedBankName}>{member?.bankName}</Text>
              <Text style={styles.savedBankNumber}>{member?.bankAccountNumber}</Text>
              <Text style={styles.savedBankHolder}>{member?.bankAccountName}</Text>
            </View>

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

            <Text style={styles.note}>* เครดิตจะถูกหักทันที และจะคืนให้หากคำขอถูกปฏิเสธ</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, paddingBottom: spacing["3xl"] },
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
  balanceLabel: { color: colors.textSecondary, ...typography.caption },
  balanceAmount: { color: colors.primary, fontSize: 24, fontWeight: "700", marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: spacing.xs },
  bankSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { color: colors.textPrimary, fontWeight: "700", fontSize: 13 },
  changeBtn: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  savedBankCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    gap: 3,
  },
  savedBankName: { color: colors.textPrimary, fontWeight: "700", fontSize: 15 },
  savedBankNumber: { color: colors.textSecondary, fontFamily: "monospace", fontSize: 14 },
  savedBankHolder: { color: colors.textMuted, fontSize: 13 },
  label: { color: colors.textPrimary, ...typography.body, fontWeight: "600", marginBottom: -spacing.xs },
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
  maxBtn: { alignSelf: "flex-start", marginTop: -spacing.xs },
  maxBtnText: { color: colors.primary, ...typography.caption, fontWeight: "600" },
  errorText: { color: "#c84b44", ...typography.caption },
  primaryButton: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    alignSelf: "stretch",
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: "#FFFFFF", ...typography.title },
  outlineButton: {
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  outlineButtonText: { color: colors.textSecondary, ...typography.title },
  note: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  noBankBox: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg },
  noBankTitle: { color: colors.textPrimary, fontWeight: "700", fontSize: 16 },
  noBankBody: { color: colors.textSecondary, ...typography.body, textAlign: "center" },
  successBox: { gap: spacing.md, alignItems: "center" },
  successIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center",
  },
  successIconText: { color: colors.primary, fontSize: 24, fontWeight: "700" },
  successTitle: { color: colors.primary, ...typography.headline },
  successBody: { color: colors.textSecondary, ...typography.body, textAlign: "center" },
});
