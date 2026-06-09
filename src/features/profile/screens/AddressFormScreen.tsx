import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppModal } from "@/components/ui/AppModal";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { navigateToHome, navigateToProfileHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileAddAddress, mobileGetAddresses, mobileUpdateAddress } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DB: DbEntry[] = require("thailand-address/lib/database/raw_database/raw_database.json") as DbEntry[];

type DbEntry = {
  district: string;   // ตำบล/แขวง
  amphoe: string;     // อำเภอ/เขต
  province: string;   // จังหวัด
  zipcode: number;
};

type Props = NativeStackScreenProps<ProfileStackParamList, "AddressForm">;

type FormState = {
  label: string;
  storeName: string;
  recipient: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
};

const EMPTY: FormState = {
  label: "",
  storeName: "",
  recipient: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
};

function queryByZipcode(zip: string): DbEntry[] {
  const code = parseInt(zip, 10);
  if (isNaN(code)) return [];
  return DB.filter((e) => e.zipcode === code);
}

export function AddressFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<Props["route"]>();
  const token = useAppStore((state) => state.token);
  const { addressId } = route.params ?? {};

  const [form, setForm] = useState<FormState>(EMPTY);
  const [isLoading, setIsLoading] = useState(Boolean(addressId));
  const [isSaving, setIsSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Subdistrict picker state
  const [subdistrictOptions, setSubdistrictOptions] = useState<string[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  const pageTitle = addressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่";

  // Ref to track whether we should suppress the postalCode auto-fill
  // (e.g. when loading an existing address that already has all fields set)
  const suppressAutoFill = useRef(false);

  useEffect(() => {
    if (!addressId || !token) return;
    mobileGetAddresses(token)
      .then((list) => {
        const addr = list.find((entry) => entry.id === addressId);
        if (addr) {
          suppressAutoFill.current = true;
          setForm({
            label: addr.label ?? "",
            storeName: addr.storeName ?? "",
            recipient: addr.recipient,
            phone: addr.phone,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 ?? "",
            subdistrict: "",        // MemberAddress has no subdistrict field
            district: addr.district ?? "",
            province: addr.province ?? "",
            postalCode: addr.postalCode ?? "",
          });
        }
      })
      .catch(() => setErrorModal("โหลดข้อมูลที่อยู่ไม่สำเร็จ"))
      .finally(() => setIsLoading(false));
  }, [addressId, token]);

  function update(next: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  // Auto-fill district/province from postalCode
  function handlePostalCodeChange(value: string) {
    update({ postalCode: value });

    if (suppressAutoFill.current) {
      suppressAutoFill.current = false;
      return;
    }

    if (value.length === 5) {
      const matches = queryByZipcode(value);
      if (matches.length > 0) {
        const first = matches[0];
        const subdistricts = [...new Set(matches.map((e) => e.district))];
        update({
          district: first.amphoe,
          province: first.province,
          subdistrict: subdistricts[0] ?? "",
        });
        setSubdistrictOptions(subdistricts);
      }
    } else {
      setSubdistrictOptions([]);
    }
  }

  async function handleSave() {
    setFieldError(null);
    if (!form.recipient.trim()) { setFieldError("กรุณากรอกชื่อผู้รับ"); return; }
    if (!form.phone.trim()) { setFieldError("กรุณากรอกเบอร์โทร"); return; }
    if (!/^\d{10}$/.test(form.phone.trim())) { setFieldError("เบอร์โทรต้องเป็นตัวเลข 10 หลัก"); return; }
    if (!form.addressLine1.trim()) { setFieldError("กรุณากรอกที่อยู่"); return; }
    if (form.postalCode && !/^\d{5}$/.test(form.postalCode.trim())) { setFieldError("รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก"); return; }
    if (!token) return;

    setIsSaving(true);
    try {
      const payload = {
        label: form.label || undefined,
        storeName: form.storeName || undefined,
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
    } catch (error) {
      setErrorModal(error instanceof Error ? error.message : "กรุณาลองใหม่");
    } finally {
      setIsSaving(false);
    }
  }

  const appHeader = (
    <AppHeader
      title={pageTitle}
      breadcrumbs={[
        { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
        { label: "บัญชีของฉัน", onPress: () => navigateToProfileHome(navigation) },
        { label: "ที่อยู่ของฉัน", onPress: () => navigation.navigate("Addresses") },
        { label: pageTitle },
      ]}
    />
  );

  if (isLoading) {
    return (
      <Screen contentContainerStyle={styles.content}>
        {appHeader}
        <Text style={styles.loading}>กำลังโหลด...</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppModal
        visible={errorModal !== null}
        type="error"
        title="เกิดข้อผิดพลาด"
        message={errorModal ?? ""}
        confirmLabel="ตกลง"
        onConfirm={() => setErrorModal(null)}
      />
      {appHeader}
      <View style={styles.card}>
        <Field
          label="ชื่อร้านหรือบริษัทของท่าน (ถ้ามี)"
          placeholder="เช่น ร้านบิวตี้อัพ"
          value={form.label}
          onChangeText={(value) => update({ label: value })}
        />
        <Field
          label="ชื่อผู้รับ *"
          placeholder="ชื่อ-นามสกุลผู้รับ"
          value={form.recipient}
          onChangeText={(value) => update({ recipient: value })}
        />
        <Field
          label="เบอร์โทรผู้รับ *"
          placeholder="0812345678"
          value={form.phone}
          onChangeText={(value) => update({ phone: value })}
          keyboardType="phone-pad"
        />
        <Field
          label="ที่อยู่บรรทัด 1 *"
          placeholder="บ้านเลขที่ / ถนน / ซอย"
          value={form.addressLine1}
          onChangeText={(value) => update({ addressLine1: value })}
        />
        <Field
          label="ที่อยู่บรรทัด 2"
          placeholder="อาคาร / ห้อง / หมู่บ้าน (ถ้ามี)"
          value={form.addressLine2}
          onChangeText={(value) => update({ addressLine2: value })}
        />

        {/* Postal code — drives auto-fill */}
        <Field
          label="รหัสไปรษณีย์"
          placeholder="10110"
          value={form.postalCode}
          onChangeText={handlePostalCodeChange}
          keyboardType="numeric"
          maxLength={5}
        />

        {/* Subdistrict picker — appears after postal code resolves options */}
        {subdistrictOptions.length > 0 && (
          <View style={styles.field}>
            <Text style={styles.label}>ตำบล/แขวง</Text>
            <Pressable style={styles.pickerBtn} onPress={() => setPickerVisible(true)}>
              <Text style={form.subdistrict ? styles.pickerValue : styles.pickerPlaceholder}>
                {form.subdistrict || "เลือกตำบล/แขวง"}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.row2}>
          <View style={styles.flexField}>
            <Field
              label="อำเภอ/เขต"
              placeholder="คลองเตย"
              value={form.district}
              onChangeText={(value) => update({ district: value })}
            />
          </View>
          <View style={styles.flexField}>
            <Field
              label="จังหวัด"
              placeholder="กรุงเทพฯ"
              value={form.province}
              onChangeText={(value) => update({ province: value })}
            />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>ยกเลิก</Text>
        </Pressable>
        {fieldError ? <Text style={styles.fieldError}>{fieldError}</Text> : null}
        <Pressable
          style={[styles.saveBtn, isSaving && styles.btnDisabled]}
          onPress={() => void handleSave()}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>{isSaving ? "กำลังบันทึก..." : "บันทึก"}</Text>
        </Pressable>
      </View>

      {/* Subdistrict picker modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>เลือกตำบล/แขวง</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {subdistrictOptions.map((name) => (
              <Pressable
                key={name}
                style={[styles.sheetItem, form.subdistrict === name && styles.sheetItemActive]}
                onPress={() => {
                  update({ subdistrict: name });
                  setPickerVisible(false);
                }}
              >
                <Text style={[styles.sheetItemText, form.subdistrict === name && styles.sheetItemTextActive]}>
                  {name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
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
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "phone-pad" | "numeric";
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.45)"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        maxLength={maxLength}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  loading: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing["3xl"],
    ...typography.body,
  },
  card: {
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    ...typography.caption,
    fontWeight: "500",
  },
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
  pickerBtn: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: {
    color: "#ffffff",
    ...typography.body,
  },
  pickerPlaceholder: {
    color: colors.textMuted,
    ...typography.body,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 20,
  },
  row2: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flexField: {
    flex: 1,
  },
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
  cancelText: {
    color: colors.textSecondary,
    ...typography.title,
  },
  fieldError: { color: "#dc2626", fontSize: 12, marginBottom: 8, paddingHorizontal: 4 },
  saveBtn: {
    flex: 2,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveText: {
    color: "#FFF",
    ...typography.title,
  },
  // Subdistrict picker modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing["3xl"],
    maxHeight: "60%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    color: colors.textPrimary,
    ...typography.title,
    paddingHorizontal: spacing["2xl"],
    marginBottom: spacing.md,
  },
  sheetItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  sheetItemActive: {
    backgroundColor: colors.primarySoft,
  },
  sheetItemText: {
    color: colors.textPrimary,
    ...typography.body,
  },
  sheetItemTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
});
