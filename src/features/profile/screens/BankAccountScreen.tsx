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
import { mobileUpdateBankAccount } from "@/services/api";
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

export function BankAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((s) => s.token);
  const member = useAppStore((s) => s.member);
  const refreshProfile = useAppStore((s) => s.refreshProfile);

  const hasSaved = !!(member?.bankName);

  const [bankName, setBankName] = useState(member?.bankName ?? "");
  const [bankAccountNumber, setBankAccountNumber] = useState(member?.bankAccountNumber ?? "");
  const [bankAccountName, setBankAccountName] = useState(member?.bankAccountName ?? "");
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!bankName) { setError("กรุณาเลือกธนาคาร"); return; }
    if (!bankAccountNumber.trim()) { setError("กรุณากรอกเลขที่บัญชี"); return; }
    if (!bankAccountName.trim()) { setError("กรุณากรอกชื่อบัญชี"); return; }
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      await mobileUpdateBankAccount(token, bankName, bankAccountNumber.trim(), bankAccountName.trim());
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="บัญชีธนาคาร"
          subtitle="บัญชีสำหรับรับเงินถอน Credit"
          breadcrumbs={[
            { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
            { label: "บัญชีธนาคาร" },
          ]}
        />
      }
    >
      <View style={styles.card}>
        {saved ? (
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>บันทึกบัญชีแล้ว</Text>
            <View style={styles.savedPreview}>
              <Text style={styles.savedBankName}>{bankName}</Text>
              <Text style={styles.savedBankNumber}>{bankAccountNumber}</Text>
              <Text style={styles.savedBankHolder}>{bankAccountName}</Text>
            </View>
            <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryButtonText}>กลับ</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Current saved account (read-only preview) */}
            {hasSaved && (
              <View style={styles.currentBox}>
                <Text style={styles.currentLabel}>บัญชีปัจจุบัน</Text>
                <Text style={styles.currentBankName}>{member?.bankName}</Text>
                <Text style={styles.currentSub}>{member?.bankAccountNumber} · {member?.bankAccountName}</Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>
              {hasSaved ? "แก้ไขบัญชี" : "เพิ่มบัญชีธนาคาร"}
            </Text>

            {/* Bank picker */}
            <Text style={styles.label}>ธนาคาร</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerBtn]}
              onPress={() => setShowPicker(true)}
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
              onPress={() => void handleSave()}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.primaryButtonText}>บันทึก</Text>
              }
            </Pressable>
          </>
        )}
      </View>

      {/* Bank picker modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>เลือกธนาคาร</Text>
            <FlatList
              data={THAI_BANKS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankOption}
                  onPress={() => { setBankName(item); setShowPicker(false); setError(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.bankOptionText, bankName === item && styles.bankOptionSelected]}>
                    {item}
                  </Text>
                  {bankName === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  currentBox: {
    borderRadius: radius.md,
    backgroundColor: "#F0FAF4",
    borderWidth: 1,
    borderColor: "#B7DDC7",
    padding: spacing.md,
    gap: 3,
    marginBottom: spacing.sm,
  },
  currentLabel: { color: "#2f7a4f", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  currentBankName: { color: colors.textPrimary, fontWeight: "700", fontSize: 15 },
  currentSub: { color: colors.textSecondary, fontSize: 13 },
  sectionLabel: { color: colors.textPrimary, fontWeight: "700", fontSize: 14 },
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
  pickerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pickerText: { color: colors.textPrimary, fontSize: 16 },
  pickerPlaceholder: { color: colors.textMuted, fontSize: 16 },
  pickerChevron: { color: colors.textMuted, fontSize: 11 },
  errorText: { color: "#c84b44", ...typography.caption },
  primaryButton: {
    height: 52, borderRadius: radius.pill, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginTop: spacing.sm,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: "#FFFFFF", ...typography.title },
  successBox: { alignItems: "center", gap: spacing.md },
  successIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center",
  },
  successIconText: { color: colors.primary, fontSize: 24, fontWeight: "700" },
  successTitle: { color: colors.primary, ...typography.headline },
  savedPreview: {
    width: "100%", borderRadius: radius.md, backgroundColor: colors.surfaceMuted,
    borderWidth: 1, borderColor: colors.borderSoft, padding: spacing.md, gap: 3,
  },
  savedBankName: { color: colors.textPrimary, fontWeight: "700", fontSize: 15 },
  savedBankNumber: { color: colors.textSecondary, fontSize: 14 },
  savedBankHolder: { color: colors.textMuted, fontSize: 13 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing["2xl"], paddingBottom: spacing["3xl"], maxHeight: "70%",
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.borderSoft, alignSelf: "center", marginVertical: spacing.md,
  },
  modalTitle: { color: colors.textPrimary, fontWeight: "700", fontSize: 16, marginBottom: spacing.md },
  bankOption: { paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bankOptionText: { color: colors.textPrimary, fontSize: 15 },
  bankOptionSelected: { color: colors.primary, fontWeight: "600" },
  checkmark: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  separator: { height: 1, backgroundColor: colors.borderSoft },
});
