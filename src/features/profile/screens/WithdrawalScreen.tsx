import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileRequestWithdrawal } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

const THAI_BANKS = [
  "ธนาคารกสิกรไทย (KBank)",
  "ธนาคารไทยพาณิชย์ (SCB)",
  "ธนาคารกรุงเทพ (BBL)",
  "ธนาคารกรุงไทย (KTB)",
  "ธนาคารกรุงศรีอยุธยา (BAY)",
  "ธนาคารทหารไทยธนชาต (TTB)",
  "ธนาคารออมสิน",
  "ธนาคารอาคารสงเคราะห์ (GHB)",
  "ธนาคารเกียรตินาคินภัทร (KKP)",
  "ธนาคารซีไอเอ็มบีไทย (CIMB)",
  "ธนาคารยูโอบี (UOB)",
  "พร้อมเพย์ (PromptPay)",
];

export function WithdrawalScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((s) => s.token);
  const member = useAppStore((s) => s.member);
  const refreshProfile = useAppStore((s) => s.refreshProfile);

  const creditBalance = member?.creditBalance ?? 0;
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError("กรุณากรอกจำนวนที่ถูกต้อง"); return; }
    if (num > creditBalance) { setError("ยอด Credit ไม่เพียงพอ"); return; }
    if (!bankName) { setError("กรุณาเลือกธนาคาร"); return; }
    if (!bankAccountNumber.trim()) { setError("กรุณากรอกเลขที่บัญชี"); return; }
    if (!bankAccountName.trim()) { setError("กรุณากรอกชื่อบัญชี"); return; }
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      await mobileRequestWithdrawal(token, {
        amount: num,
        bankName,
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountName: bankAccountName.trim(),
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
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>ส่งคำขอแล้ว</Text>
            <Text style={styles.successBody}>
              Admin จะตรวจสอบและดำเนินการภายใน 1–3 วันทำการ
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
            <Pressable
              style={styles.maxBtn}
              onPress={() => setAmount(String(creditBalance))}
            >
              <Text style={styles.maxBtnText}>
                ถอนทั้งหมด ฿{creditBalance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </Text>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>บัญชีที่ต้องการรับเงิน</Text>

            {/* Bank name picker */}
            <Text style={styles.label}>ธนาคาร</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerBtn]}
              onPress={() => setShowBankPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={bankName ? styles.pickerText : styles.pickerPlaceholder}>
                {bankName || "เลือกธนาคาร"}
              </Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>

            {/* Account number */}
            <Text style={styles.label}>เลขที่บัญชี</Text>
            <TextInput
              style={styles.input}
              value={bankAccountNumber}
              onChangeText={(v) => { setBankAccountNumber(v); setError(null); }}
              keyboardType="numeric"
              placeholder="เช่น 0001234567"
              placeholderTextColor={colors.textMuted}
            />

            {/* Account name */}
            <Text style={styles.label}>ชื่อบัญชี (ชื่อ-นามสกุล)</Text>
            <TextInput
              style={styles.input}
              value={bankAccountName}
              onChangeText={(v) => { setBankAccountName(v); setError(null); }}
              placeholder="ชื่อ นามสกุล ตามบัญชีธนาคาร"
              placeholderTextColor={colors.textMuted}
            />

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
              * credit จะถูกหักทันที และจะคืนหากถูกปฏิเสธ
            </Text>
          </>
        )}
      </View>

      {/* Bank picker modal */}
      <Modal
        visible={showBankPicker}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowBankPicker(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowBankPicker(false)}>
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>เลือกธนาคาร</Text>
            <FlatList
              data={THAI_BANKS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.bankOption, bankName === item && styles.bankOptionSelected]}
                  onPress={() => { setBankName(item); setShowBankPicker(false); setError(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.bankOptionText, bankName === item && styles.bankOptionTextSelected]}>
                    {item}
                  </Text>
                  {bankName === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.bankSeparator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginVertical: spacing.xs,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  label: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: "600",
    marginBottom: -spacing.xs,
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
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: colors.textMuted,
    fontSize: 16,
  },
  pickerChevron: {
    color: colors.textMuted,
    fontSize: 11,
  },
  maxBtn: {
    alignSelf: "flex-start",
    marginTop: -spacing.xs,
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
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  successIconText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "700",
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
  // Bank picker modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSoft,
    alignSelf: "center",
    marginVertical: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: spacing.md,
  },
  bankOption: {
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bankOptionSelected: {
    // no background, just checkmark
  },
  bankOptionText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  bankOptionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  bankSeparator: {
    height: 1,
    backgroundColor: colors.borderSoft,
  },
});
