import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing, typography } from "@/theme";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "error" | "success" | "info" | "confirm";
};

export function AppModal({
  visible,
  title,
  message,
  confirmLabel = "ตกลง",
  cancelLabel = "ยกเลิก",
  onConfirm,
  onCancel,
  type = "error",
}: Props) {

  // Icon per type
  function renderIcon() {
    if (type === "confirm") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: "rgba(212,175,55,0.3)" }]}>
          <MaterialIcons name="card-giftcard" size={28} color={colors.gold} />
        </View>
      );
    }
    if (type === "success") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#F0FDF4" }]}>
          <MaterialIcons name="check-circle-outline" size={28} color={colors.primary} />
        </View>
      );
    }
    if (type === "error") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#FEF2F2" }]}>
          <MaterialIcons name="error-outline" size={28} color="#DC2626" />
        </View>
      );
    }
    return (
      <View style={[styles.iconCircle, { backgroundColor: "#F0F4FF" }]}>
        <MaterialIcons name="info-outline" size={28} color="#3B82F6" />
      </View>
    );
  }

  // Confirm button color per type
  const confirmBg =
    type === "confirm" ? colors.gold :
    type === "success" ? colors.primary :
    type === "error"   ? "#DC2626" :
    colors.primary;

  const confirmTextColor =
    type === "confirm" ? colors.goldDark : "#FFFFFF";

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {renderIcon()}
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={onCancel ? styles.buttonRow : styles.buttonSingle}>
            {onCancel ? (
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.confirmButton, onCancel && styles.confirmButtonFlex, { backgroundColor: confirmBg }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmButtonText, { color: confirmTextColor }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["2xl"],
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: fonts.medium,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  buttonSingle: {
    marginTop: spacing.md,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  confirmButton: {
    width: "100%",
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  confirmButtonFlex: {
    flex: 1,
    width: undefined,
  },
  confirmButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
