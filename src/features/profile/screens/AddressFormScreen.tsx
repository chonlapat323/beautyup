import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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

// Precompute sorted unique lists
const ALL_PROVINCES = [...new Set(DB.map((e) => e.province))].sort((a, b) => a.localeCompare(b, "th"));

function getAmphoeList(province: string): string[] {
  return [...new Set(DB.filter((e) => e.province === province).map((e) => e.amphoe))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );
}

function getSubdistrictList(province: string, amphoe: string): string[] {
  return [...new Set(DB.filter((e) => e.province === province && e.amphoe === amphoe).map((e) => e.district))].sort(
    (a, b) => a.localeCompare(b, "th"),
  );
}

function getZipcode(province: string, amphoe: string, subdistrict: string): string {
  const entry = DB.find((e) => e.province === province && e.amphoe === amphoe && e.district === subdistrict);
  return entry ? String(entry.zipcode) : "";
}

type PickerField = "province" | "amphoe" | "subdistrict";

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

  const [pickerField, setPickerField] = useState<PickerField | null>(null);
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");

  const pageTitle = addressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่";
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
            subdistrict: "",
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

  function openPicker(field: PickerField) {
    let options: string[] = [];
    if (field === "province") {
      options = ALL_PROVINCES;
    } else if (field === "amphoe") {
      if (!form.province) return;
      options = getAmphoeList(form.province);
    } else if (field === "subdistrict") {
      if (!form.province || !form.district) return;
      options = getSubdistrictList(form.province, form.district);
    }
    setPickerOptions(options);
    setPickerSearch("");
    setPickerField(field);
  }

  function handlePickerSelect(value: string) {
    if (pickerField === "province") {
      update({ province: value, district: "", subdistrict: "", postalCode: "" });
    } else if (pickerField === "amphoe") {
      update({ district: value, subdistrict: "", postalCode: "" });
    } else if (pickerField === "subdistrict") {
      const zip = getZipcode(form.province, form.district, value);
      update({ subdistrict: value, postalCode: zip });
    }
    setPickerField(null);
    setPickerSearch("");
  }

  function currentValue(field: PickerField): string {
    if (field === "province") return form.province;
    if (field === "amphoe") return form.district;
    return form.subdistrict;
  }

  function pickerTitle(field: PickerField): string {
    if (field === "province") return "เลือกจังหวัด";
    if (field === "amphoe") return "เลือกอำเภอ/เขต";
    return "เลือกตำบล/แขวง";
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
        subdistrict: form.subdistrict || undefined,
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

        {/* Province picker */}
        <PickerField
          label="จังหวัด"
          value={form.province}
          placeholder="เลือกจังหวัด"
          onPress={() => openPicker("province")}
        />

        {/* Amphoe picker — only after province selected */}
        {form.province ? (
          <PickerField
            label="อำเภอ/เขต"
            value={form.district}
            placeholder="เลือกอำเภอ/เขต"
            onPress={() => openPicker("amphoe")}
          />
        ) : null}

        {/* Subdistrict picker — only after amphoe selected */}
        {form.district ? (
          <PickerField
            label="ตำบล/แขวง"
            value={form.subdistrict}
            placeholder="เลือกตำบล/แขวง"
            onPress={() => openPicker("subdistrict")}
          />
        ) : null}

        {/* Postal code — auto-filled or manual fallback */}
        <Field
          label="รหัสไปรษณีย์"
          placeholder="10110"
          value={form.postalCode}
          onChangeText={(value) => update({ postalCode: value })}
          keyboardType="numeric"
          maxLength={5}
        />
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

      {/* Generic picker modal */}
      <Modal
        visible={pickerField !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerField(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPickerField(null)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>{pickerField ? pickerTitle(pickerField) : ""}</Text>
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="ค้นหา..."
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                  autoCorrect={false}
                />
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {pickerOptions
                  .filter((name) => !pickerSearch || name.includes(pickerSearch))
                  .map((name) => (
                    <Pressable
                      key={name}
                      style={[styles.sheetItem, currentValue(pickerField ?? "province") === name && styles.sheetItemActive]}
                      onPress={() => handlePickerSelect(name)}
                    >
                      <Text
                        style={[
                          styles.sheetItemText,
                          currentValue(pickerField ?? "province") === name && styles.sheetItemTextActive,
                        ]}
                      >
                        {name}
                      </Text>
                    </Pressable>
                  ))}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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

function PickerField({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.pickerBtn} onPress={onPress}>
        <Text style={value ? styles.pickerValue : styles.pickerPlaceholder}>{value || placeholder}</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
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
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: 480,
    paddingBottom: spacing["3xl"],
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
    marginBottom: spacing.sm,
  },
  searchBox: {
    marginHorizontal: spacing["2xl"],
    marginBottom: spacing.sm,
  },
  searchInput: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    color: "#ffffff",
    ...typography.body,
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
