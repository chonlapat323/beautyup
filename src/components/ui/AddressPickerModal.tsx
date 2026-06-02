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
import { MaterialIcons } from "@expo/vector-icons";

import type { MemberAddress } from "@/services/api";
import { mobileGetAddresses } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !token) return;
    setLoading(true);
    mobileGetAddresses(token)
      .then((list) => {
        setAddresses(list);
        // Pre-select default address
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setSelectedId(def.id);
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [visible, token]);

  function handleConfirm() {
    const addr = addresses.find((a) => a.id === selectedId);
    if (addr) onSelect(addr);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />
        <Text style={styles.title}>เลือกที่อยู่จัดส่ง</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.gold} />
        ) : addresses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>ยังไม่มีที่อยู่จัดส่ง</Text>
            <Pressable style={styles.addBtnOutline} onPress={() => { onClose(); onAddAddress(); }}>
              <Text style={styles.addBtnOutlineText}>+ เพิ่มที่อยู่</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedId;
                return (
                  <Pressable
                    key={addr.id}
                    style={[styles.item, isSelected && styles.itemSelected]}
                    onPress={() => setSelectedId(addr.id)}
                  >
                    {/* Radio */}
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>

                    {/* Content */}
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
                          .filter(Boolean).join(" ")}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}

              <Pressable style={styles.addBtnRow} onPress={() => { onClose(); onAddAddress(); }}>
                <MaterialIcons name="add" size={16} color={colors.primary} />
                <Text style={styles.addBtnText}>เพิ่มที่อยู่ใหม่</Text>
              </Pressable>
            </ScrollView>

            {/* ✦ Gold confirm button */}
            <Pressable
              style={[styles.confirmBtn, !selectedId && styles.confirmBtnDisabled]}
              disabled={!selectedId}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmBtnText}>ใช้ที่อยู่นี้</Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 28,
    maxHeight: "78%",
  },
  handle: {
    width: 44, height: 4, borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 12, marginBottom: 16,
  },
  title: {
    color: "#1A1A1A",
    fontSize: 17,
    fontFamily: fonts.bold,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  loader: { marginVertical: 32 },
  empty: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20, gap: 16 },
  emptyText: { color: "#6B7280", fontSize: 14, fontFamily: fonts.medium },
  list: { paddingHorizontal: 16 },

  // Address item
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    marginBottom: 10,
    padding: 14,
  },
  itemSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: "#D1D5DB",
    alignItems: "center", justifyContent: "center",
    marginTop: 2, flexShrink: 0,
  },
  radioSelected: { borderColor: colors.gold },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
  itemContent: { flex: 1, gap: 3 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  recipient: { color: "#1A1A1A", fontSize: 14, fontFamily: fonts.bold },
  defaultBadge: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.35)",
  },
  defaultBadgeText: { color: colors.goldDeep, fontSize: 10, fontFamily: fonts.bold },
  phone: { color: "#6B7280", fontSize: 12, fontFamily: fonts.medium },
  address: { color: "#6B7280", fontSize: 12, fontFamily: fonts.medium, lineHeight: 17 },

  addBtnRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 14 },
  addBtnText: { color: colors.primary, fontSize: 14, fontFamily: fonts.semiBold },
  addBtnOutline: {
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary,
    paddingVertical: 10, paddingHorizontal: 24,
  },
  addBtnOutlineText: { color: colors.primary, fontSize: 14, fontFamily: fonts.semiBold },

  // ✦ Gold confirm button
  confirmBtn: {
    marginHorizontal: 16, marginTop: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  confirmBtnDisabled: { backgroundColor: "#D1D5DB", shadowOpacity: 0 },
  confirmBtnText: { color: colors.goldDark, fontSize: 16, fontFamily: fonts.bold },
});
