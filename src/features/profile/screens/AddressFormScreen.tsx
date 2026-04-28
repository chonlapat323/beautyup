import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import type { ProfileStackParamList } from "@/navigation/types";
import {
  mobileAddAddress,
  mobileGetAddresses,
  mobileUpdateAddress,
} from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "AddressForm">;

type FormState = {
  label: string;
  recipient: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  district: string;
  province: string;
  postalCode: string;
};

const EMPTY: FormState = {
  label: "",
  recipient: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  district: "",
  province: "",
  postalCode: "",
};

export function AddressFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<Props["route"]>();
  const token = useAppStore((state) => state.token);
  const { addressId } = route.params ?? {};

  const [form, setForm] = useState<FormState>(EMPTY);
  const [isLoading, setIsLoading] = useState(!!addressId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!addressId || !token) return;
    mobileGetAddresses(token)
      .then((list) => {
        const addr = list.find((a) => a.id === addressId);
        if (addr) {
          setForm({
            label: addr.label ?? "",
            recipient: addr.recipient,
            phone: addr.phone,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 ?? "",
            district: addr.district ?? "",
            province: addr.province ?? "",
            postalCode: addr.postalCode ?? "",
          });
        }
      })
      .catch(() => Alert.alert("โหลดข้อมูลที่อยู่ไม่สำเร็จ"))
      .finally(() => setIsLoading(false));
  }, [addressId, token]);

  function update(next: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  async function handleSave() {
    if (!form.recipient || !form.phone || !form.addressLine1) {
      Alert.alert("กรุณากรอกชื่อผู้รับ, เบอร์โทร และที่อยู่");
      return;
    }
    if (!token) return;
    setIsSaving(true);
    try {
      const payload = {
        label: form.label || undefined,
        recipient: form.recipient,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        district: form.district || undefined,
        province: form.province || undefined,
        postalCode: form.postalCode || undefined,
      };
      if (addressId) {
        await mobileUpdateAddress(token, addressId, payload);
      } else {
        await mobileAddAddress(token, payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert("บันทึกไม่สำเร็จ", e instanceof Error ? e.message : "กรุณาลองใหม่");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Screen contentContainerStyle={styles.content} header={<AppHeader title={addressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่"} />}>
        <Text style={styles.loading}>กำลังโหลด...</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title={addressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่"} />

      <View style={styles.card}>
        <Field label="ชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)" placeholder="บ้าน" value={form.label} onChangeText={(v) => update({ label: v })} />
        <Field label="ชื่อผู้รับ *" placeholder="ชื่อ-นามสกุลผู้รับ" value={form.recipient} onChangeText={(v) => update({ recipient: v })} />
        <Field label="เบอร์โทรผู้รับ *" placeholder="0812345678" value={form.phone} onChangeText={(v) => update({ phone: v })} keyboardType="phone-pad" />
        <Field label="ที่อยู่บรรทัด 1 *" placeholder="บ้านเลขที่ / ถนน / ซอย" value={form.addressLine1} onChangeText={(v) => update({ addressLine1: v })} />
        <Field label="ที่อยู่บรรทัด 2" placeholder="อาคาร / ห้อง / หมู่บ้าน (ถ้ามี)" value={form.addressLine2} onChangeText={(v) => update({ addressLine2: v })} />

        <View style={styles.row3}>
          <View style={{ flex: 1 }}>
            <Field label="เขต/อำเภอ" placeholder="คลองเตย" value={form.district} onChangeText={(v) => update({ district: v })} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="จังหวัด" placeholder="กรุงเทพฯ" value={form.province} onChangeText={(v) => update({ province: v })} />
          </View>
          <View style={{ width: 90 }}>
            <Field label="รหัสไปรษณีย์" placeholder="10110" value={form.postalCode} onChangeText={(v) => update({ postalCode: v })} keyboardType="numeric" maxLength={5} />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>ยกเลิก</Text>
        </Pressable>
        <Pressable style={[styles.saveBtn, isSaving && styles.btnDisabled]} onPress={() => void handleSave()} disabled={isSaving}>
          <Text style={styles.saveText}>{isSaving ? "กำลังบันทึก..." : "บันทึก"}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "phone-pad" | "numeric";
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        maxLength={maxLength}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing["3xl"] },
  loading: { color: colors.textSecondary, textAlign: "center", marginTop: spacing["3xl"], ...typography.body },
  card: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.md,
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
    color: colors.textPrimary,
    ...typography.body,
  },
  row3: { flexDirection: "row", gap: spacing.sm },
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
  saveText: { color: "#FFF", ...typography.title },
});
