import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

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
  const iconColor =
    type === "success" ? colors.primary :
    type === "error"   ? "#dc2626" :
    type === "confirm" ? colors.primary :
    colors.textSecondary;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : type === "confirm" ? "?" : "i";

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor + "18" }]}>
            <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={onCancel ? styles.buttonRow : styles.buttonSingle}>
            {onCancel ? (
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable style={[styles.confirmButton, onCancel && styles.confirmButtonFlex]} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
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
    borderRadius: radius.xl,
    padding: spacing["3xl"],
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  iconText: {
    fontSize: 24,
    fontWeight: "700",
  },
  title: {
    color: colors.textPrimary,
    ...typography.title,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    ...typography.body,
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
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    ...typography.title,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  confirmButtonFlex: {
    flex: 1,
    width: undefined,
  },
  confirmButtonText: {
    color: "#fff",
    ...typography.title,
  },
});
