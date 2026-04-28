import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { navigateToHome, navigateToProfileHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import type { MemberAddress } from "@/services/api";
import { mobileDeleteAddress, mobileGetAddresses, mobileSetDefaultAddress } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function AddressesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((state) => state.token);
  const [addresses, setAddresses] = useState<MemberAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [token]),
  );

  async function load() {
    if (!token) return;
    setIsLoading(true);
    try {
      setAddresses(await mobileGetAddresses(token));
    } catch {
      Alert.alert("โหลดที่อยู่ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetDefault(addr: MemberAddress) {
    if (!token) return;
    try {
      await mobileSetDefaultAddress(token, addr.id);
      await load();
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error instanceof Error ? error.message : "กรุณาลองใหม่");
    }
  }

  async function handleDelete(addr: MemberAddress) {
    Alert.alert("ลบที่อยู่", `ต้องการลบ "${addr.label ?? addr.addressLine1}"?`, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          try {
            await mobileDeleteAddress(token, addr.id);
            await load();
          } catch (error) {
            Alert.alert("ลบไม่สำเร็จ", error instanceof Error ? error.message : "กรุณาลองใหม่");
          }
        },
      },
    ]);
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="ที่อยู่ของฉัน"
          subtitle="จัดการที่อยู่สำหรับจัดส่งสินค้า"
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "บัญชีของฉัน", onPress: () => navigateToProfileHome(navigation) },
            { label: "ที่อยู่ของฉัน" },
          ]}
        />
      }
    >
      {isLoading ? (
        <Text style={styles.placeholder}>กำลังโหลด...</Text>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>ยังไม่มีที่อยู่ที่บันทึกไว้</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              addr={addr}
              onEdit={() => navigation.navigate("AddressForm", { addressId: addr.id })}
              onDelete={() => void handleDelete(addr)}
              onSetDefault={() => void handleSetDefault(addr)}
            />
          ))}
        </View>
      )}

      <Pressable style={styles.addBtn} onPress={() => navigation.navigate("AddressForm", {})}>
        <Text style={styles.addBtnText}>+ เพิ่มที่อยู่ใหม่</Text>
      </Pressable>
    </Screen>
  );
}

function AddressCard({
  addr,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  addr: MemberAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const lines = [
    addr.addressLine1,
    addr.addressLine2,
    [addr.district, addr.province].filter(Boolean).join(" "),
    addr.postalCode,
  ].filter(Boolean);

  return (
    <View style={[styles.card, addr.isDefault && styles.cardDefault]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderCopy}>
          {addr.label ? <Text style={styles.cardLabel}>{addr.label}</Text> : null}
          {addr.isDefault ? (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>ที่อยู่หลัก</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.recipient}>{addr.recipient}</Text>
      <Text style={styles.phone}>{addr.phone}</Text>
      <Text style={styles.addrText}>{lines.join(", ")}</Text>

      <View style={styles.cardActions}>
        {!addr.isDefault ? (
          <Pressable style={styles.actionBtn} onPress={onSetDefault}>
            <Text style={styles.actionBtnText}>ตั้งเป็นที่อยู่หลัก</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.actionBtn} onPress={onEdit}>
          <Text style={styles.actionBtnText}>แก้ไข</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Text style={styles.deleteBtnText}>ลบ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  placeholder: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing["3xl"],
    ...typography.body,
  },
  emptyBox: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["2xl"],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderStyle: "dashed",
    padding: spacing["3xl"],
    alignItems: "center",
  },
  emptyText: {
    color: colors.textMuted,
    ...typography.body,
  },
  list: {
    marginHorizontal: spacing["2xl"],
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardDefault: {
    borderColor: colors.primary,
    backgroundColor: "#F0FAF4",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderCopy: {
    gap: 2,
  },
  cardLabel: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  defaultBadge: {
    marginTop: 2,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  recipient: {
    color: colors.textPrimary,
    ...typography.title,
    marginTop: spacing.xs,
  },
  phone: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  addrText: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: spacing.xs,
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionBtnText: {
    color: colors.textPrimary,
    ...typography.caption,
  },
  deleteBtn: {
    borderColor: "#FCA5A5",
  },
  deleteBtnText: {
    color: "#EF4444",
    ...typography.caption,
  },
  addBtn: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing["2xl"],
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#FFF",
    ...typography.title,
  },
});
