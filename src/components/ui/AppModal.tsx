import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  type?: "error" | "success" | "info";
};

export function AppModal({ visible, title, message, confirmLabel = "ตกลง", onConfirm, type = "error" }: Props) {
  const iconColor = type === "success" ? colors.primary : type === "error" ? "#dc2626" : colors.textSecondary;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "i";

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor + "18" }]}>
            <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable style={styles.button} onPress={onConfirm}>
            <Text style={styles.buttonText}>{confirmLabel}</Text>
          </Pressable>
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
  button: {
    marginTop: spacing.md,
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    ...typography.title,
  },
});
