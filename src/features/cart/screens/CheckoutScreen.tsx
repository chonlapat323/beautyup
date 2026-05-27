import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import type { MemberAddress } from "@/services/api";
import { mobileGetAddresses } from "@/services/api";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";
import { Switch } from "react-native";

function fmtBaht(n: number) {
  return `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const cart = useAppStore((state) => state.cart);
  const token = useAppStore((state) => state.token);
  const member = useAppStore((state) => state.member);
  const summary = getCartSummary(cart);

  const creditBalance = member?.creditBalance ?? 0;
  const [useCredit, setUseCredit] = useState(false);
  const [note, setNote] = useState("");
  const subtotalWithShipping = summary.subtotal + summary.shippingFee;
  const creditUsed = useCredit ? Math.floor(Math.min(creditBalance, subtotalWithShipping)) : 0;
  const remaining = Math.max(0, subtotalWithShipping - creditUsed);

  const [addresses, setAddresses] = useState<MemberAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoadingAddresses(false);
      return;
    }
    setAddressError(false);
    mobileGetAddresses(token)
      .then((list) => {
        setAddresses(list);
        const defaultAddress = list.find((address) => address.isDefault) ?? list[0];
        if (defaultAddress) setSelectedId(defaultAddress.id);
      })
      .catch(() => setAddressError(true))
      .finally(() => setIsLoadingAddresses(false));
  }, [token]);

  const selected = addresses.find((address) => address.id === selectedId);

  function handleConfirm() {
    if (!selected) return;
    const addrLines = [
      selected.addressLine1,
      selected.addressLine2,
      [selected.district, selected.province].filter(Boolean).join(" "),
      selected.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    navigation.navigate("Payment", {
      shippingName: selected.recipient,
      shippingPhone: selected.phone,
      shippingAddr: addrLines,
      creditAmount: creditUsed > 0 ? creditUsed : undefined,
      note: note.trim() || undefined,
    });
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="ตรวจสอบคำสั่งซื้อ"
          subtitle="เลือกที่อยู่จัดส่งและยืนยันรายการของคุณ"
          breadcrumbs={[
            { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
            { label: "ตะกร้าสินค้า", onPress: () => navigation.navigate("Cart") },
            { label: "ตรวจสอบคำสั่งซื้อ" },
          ]}
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ที่อยู่จัดส่ง</Text>

        {isLoadingAddresses ? (
          <Text style={styles.hint}>กำลังโหลดที่อยู่...</Text>
        ) : addressError ? (
          <View style={styles.noAddressBox}>
            <Text style={styles.noAddressText}>โหลดที่อยู่ไม่สำเร็จ</Text>
            <Text style={styles.hint}>กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.noAddressBox}>
            <Text style={styles.noAddressText}>ยังไม่มีที่อยู่ที่บันทึกไว้</Text>
            <Text style={styles.hint}>กรุณาเพิ่มที่อยู่ในหน้าโปรไฟล์ก่อนสั่งซื้อ</Text>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedId;
              const lines = [
                addr.addressLine1,
                addr.addressLine2,
                [addr.district, addr.province].filter(Boolean).join(" "),
                addr.postalCode,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <Pressable
                  key={addr.id}
                  style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                  onPress={() => setSelectedId(addr.id)}
                >
                  <View style={styles.radioRow}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={styles.addressCopy}>
                      <View style={styles.cardLabelRow}>
                        {addr.label ? <Text style={styles.addrLabel}>{addr.label}</Text> : null}
                        {addr.isDefault ? (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>หลัก</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.addrRecipient}>
                        {addr.recipient} · {addr.phone}
                      </Text>
                      <Text style={styles.addrLines}>{lines}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {creditBalance > 0 && (
        <View style={styles.creditToggleCard}>
          <View style={styles.creditToggleRow}>
            <View style={styles.creditToggleLeft}>
              <Text style={styles.creditToggleTitle}>ใช้เครดิต</Text>
              <Text style={styles.creditToggleSub} numberOfLines={1}>
                มี ฿{creditBalance.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <Switch
              value={useCredit}
              onValueChange={setUseCredit}
              trackColor={{ true: colors.primary, false: colors.borderSoft }}
              thumbColor="#fff"
            />
          </View>
          {useCredit && (
            <Text style={styles.creditUsedText}>
              หักออก {fmtBaht(creditUsed)}
            </Text>
          )}
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>สรุปยอดชำระ</Text>
        <Row label="ยอดสินค้า" value={fmtBaht(summary.subtotal)} />
        <Row
          label="ค่าจัดส่ง"
          value={summary.shippingFee === 0 ? "ฟรี" : fmtBaht(summary.shippingFee)}
          free={summary.shippingFee === 0}
        />
        {creditUsed > 0 && (
          <Row label="หักเครดิต" value={`-${fmtBaht(creditUsed)}`} credit />
        )}
        <Row label={remaining === 0 ? "ยอดชำระ (เครดิตครอบคลุม)" : "ยอดที่ต้องชำระเพิ่ม"} value={fmtBaht(remaining)} strong />
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteLabel}>หมายเหตุ (ถ้ามี)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="เช่น ฝากไว้ที่หน้าบ้าน, ต้องการกล่องของขวัญ..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={2}
        />
      </View>

      <Pressable
        disabled={cart.length === 0 || !selected}
        onPress={handleConfirm}
        style={[styles.button, (cart.length === 0 || !selected) && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>ไปชำระเงิน</Text>
      </Pressable>
    </Screen>
  );
}

function Row({ label, value, strong = false, credit = false, free = false }: { label: string; value: string; strong?: boolean; credit?: boolean; free?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strongText, credit && styles.creditText]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strongText, credit && styles.creditText, free && styles.freeText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  section: {
    marginHorizontal: spacing["2xl"],
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    ...typography.title,
  },
  hint: {
    color: colors.textMuted,
    ...typography.caption,
  },
  noAddressBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderStyle: "dashed",
    padding: spacing["2xl"],
    alignItems: "center",
    gap: spacing.xs,
  },
  noAddressText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  addressList: {
    gap: spacing.sm,
  },
  addressCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0FAF4",
  },
  radioRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addressCopy: {
    flex: 1,
    gap: 2,
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  addrLabel: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  defaultBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "700",
  },
  addrRecipient: {
    color: colors.textPrimary,
    ...typography.caption,
    fontWeight: "600",
  },
  addrLines: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  summaryCard: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryTitle: {
    color: colors.textPrimary,
    ...typography.title,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: {
    color: colors.textSecondary,
    ...typography.body,
  },
  rowValue: {
    color: colors.textPrimary,
    ...typography.body,
  },
  strongText: {
    ...typography.title,
  },
  creditToggleCard: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.lg,
    backgroundColor: "#F0FAF4",
    borderWidth: 1,
    borderColor: "#B7DDC7",
    padding: spacing.lg,
    gap: spacing.xs,
  },
  creditToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  creditToggleLeft: { gap: 2 },
  creditToggleTitle: { color: colors.primary, ...typography.body, fontWeight: "700" },
  creditToggleSub: { color: colors.textSecondary, ...typography.caption },
  creditUsedText: { color: colors.primary, ...typography.caption, fontWeight: "600" },
  creditText: { color: colors.primary },
  freeText: { color: "#2f7a4f", fontWeight: "700" as const },
  noteCard: {
    backgroundColor: colors.surface ?? '#fff',
    borderRadius: radius.card ?? 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: spacing.md ?? 16,
    marginBottom: spacing.sm ?? 8,
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["2xl"],
  },
  noteLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  noteInput: {
    ...typography.body,
    color: colors.text ?? '#111',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
});
