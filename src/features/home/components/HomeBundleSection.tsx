import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { colors, radius, spacing, typography } from "@/theme";
import type { Bundle } from "@/types/domain";

type Props = {
  bundles: Bundle[];
  horizontalPadding: number;
  onAddToCart: (productId: string, quantity?: number) => void;
};

export function HomeBundleSection({ bundles, horizontalPadding, onAddToCart }: Props) {
  const [selected, setSelected] = useState<Bundle | null>(null);

  if (bundles.length === 0) return null;

  function addBundleToCart(bundle: Bundle) {
    for (const item of bundle.items) {
      onAddToCart(item.productId, item.quantity);
    }
    setSelected(null);
  }

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>สูตรพิเศษ</Text>
        <Text style={styles.sectionSub}>ชุดสินค้าคัดสรรพิเศษ</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {bundles.map((bundle) => (
          <Pressable
            key={bundle.id}
            style={styles.card}
            onPress={() => setSelected(bundle)}
          >
            <CommerceImage style={styles.cardImage} uri={bundle.imageUrl} />
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={2}>{bundle.name}</Text>
              <Text style={styles.cardMeta}>{bundle.items.length} รายการ</Text>
              <Text style={styles.cardPrice}>฿{bundle.price.toLocaleString()}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelected(null)} />
        <View style={styles.sheet}>
          {selected !== null && (
            <>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{selected.name}</Text>
                <Pressable onPress={() => setSelected(null)} hitSlop={8}>
                  <MaterialIcons name="close" size={22} color={colors.textMuted} />
                </Pressable>
              </View>

              {selected.imageUrl ? (
                <CommerceImage style={styles.sheetImage} uri={selected.imageUrl} />
              ) : null}

              {selected.description ? (
                <Text style={styles.sheetDesc}>{selected.description}</Text>
              ) : null}

              <Text style={styles.itemsLabel}>สินค้าในชุด</Text>
              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {selected.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <CommerceImage style={styles.itemImage} uri={item.product.imageUrl} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                      <Text style={styles.itemPrice}>฿{item.product.price.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.itemQty}>×{item.quantity}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.sheetFooter}>
                <View>
                  <Text style={styles.totalLabel}>ราคาชุด</Text>
                  <Text style={styles.totalPrice}>฿{selected.price.toLocaleString()}</Text>
                </View>
                <Pressable
                  style={styles.addBtn}
                  onPress={() => addBundleToCart(selected)}
                >
                  <MaterialIcons name="add-shopping-cart" size={18} color="#fff" />
                  <Text style={styles.addBtnText}>เพิ่มลงตะกร้า</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing["2xl"],
  },
  header: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSub: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: 2,
  },
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    width: 160,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  cardImage: {
    width: 160,
    height: 120,
    backgroundColor: colors.surfaceMuted,
  },
  cardBody: {
    padding: spacing.md,
    gap: 2,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    minHeight: 36,
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 11,
  },
  cardPrice: {
    color: colors.primaryStrong,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
    maxHeight: "80%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSoft,
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.md,
  },
  sheetImage: {
    width: "100%",
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.md,
  },
  sheetDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  itemsLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  itemsList: {
    maxHeight: 200,
    marginBottom: spacing.lg,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
  },
  itemPrice: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  itemQty: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 0,
  },
  sheetFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  totalPrice: {
    color: colors.primaryStrong,
    fontSize: 20,
    fontWeight: "700",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
