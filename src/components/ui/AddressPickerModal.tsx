import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { MemberAddress } from "@/services/api";
import { mobileGetAddresses } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: MemberAddress) => void;
  onAddAddress: () => void;
};

export function AddressPickerModal({ visible, onClose, onSelect, onAddAddress }: Props) {
  const token = useAppStore((state) => state.token);
  const [addresses, setAddresses] = useState<MemberAddress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !token) return;
    setLoading(true);
    mobileGetAddresses(token)
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [visible, token]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>เลือกที่อยู่จัดส่ง</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : addresses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>ยังไม่มีที่อยู่จัดส่ง</Text>
            <Pressable style={styles.addBtn} onPress={() => { onClose(); onAddAddress(); }}>
              <Text style={styles.addBtnText}>+ เพิ่มที่อยู่</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {addresses.map((addr) => (
              <Pressable
                key={addr.id}
                style={styles.item}
                onPress={() => onSelect(addr)}
              >
                <View style={styles.itemContent}>
                  <View style={styles.itemRow}>
                    <Text style={styles.recipient}>{addr.recipient}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>หลัก</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.phone}>{addr.phone}</Text>
                  <Text style={styles.address} numberOfLines={2}>
                    {[addr.addressLine1, addr.addressLine2, addr.district, addr.province, addr.postalCode]
                      .filter(Boolean)
                      .join(" ")}
                  </Text>
                </View>
              </Pressable>
            ))}
            <Pressable style={styles.addBtnRow} onPress={() => { onClose(); onAddAddress(); }}>
              <Text style={styles.addBtnText}>+ เพิ่มที่อยู่ใหม่</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing["3xl"],
    maxHeight: "75%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    ...typography.title,
    paddingHorizontal: spacing["2xl"],
    marginBottom: spacing.lg,
  },
  loader: {
    marginVertical: spacing["3xl"],
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
    paddingHorizontal: spacing["2xl"],
    gap: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  list: {
    paddingHorizontal: spacing["2xl"],
  },
  item: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  itemContent: {
    padding: spacing.lg,
    gap: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  recipient: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: "600",
  },
  defaultBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  phone: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  address: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  addBtn: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["2xl"],
  },
  addBtnRow: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  addBtnText: {
    color: colors.primary,
    ...typography.body,
    fontWeight: "600",
  },
});
