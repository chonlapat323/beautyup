import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import type { ShopStackParamList } from "@/navigation/types";
import { getCartSummary, useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const cart = useAppStore((state) => state.cart);
  const checkout = useAppStore((state) => state.checkout);
  const summary = getCartSummary(cart);

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader
        title="Checkout"
        subtitle="Mock PromptPay Dynamic QR and payment summary for the demo."
      />

      <View style={styles.qrCard}>
        <Text style={styles.qrLabel}>PromptPay Dynamic QR</Text>
        <View style={styles.qrPlaceholder}>
          <View style={styles.qrGrid}>
            {Array.from({ length: 25 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.qrPixel,
                  index % 2 === 0 || index % 5 === 0 ? styles.qrPixelDark : null,
                ]}
              />
            ))}
          </View>
        </View>
        <Text style={styles.qrHint}>Scan this mock code to complete the premium checkout flow.</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment summary</Text>
        <Row label="Subtotal" value={`THB ${summary.subtotal.toFixed(0)}`} />
        <Row label="Gateway fee" value={`THB ${summary.gatewayFee.toFixed(0)}`} />
        <Row label="Total" strong value={`THB ${summary.total.toFixed(0)}`} />
      </View>

      <Pressable
        disabled={cart.length === 0}
        onPress={() => {
          const orderId = checkout();
          navigation.replace("OrderSuccess", { orderId });
        }}
        style={[styles.button, cart.length === 0 && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Confirm payment</Text>
      </Pressable>
    </Screen>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strongText]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strongText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  qrCard: {
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    alignItems: "center",
    gap: spacing.md,
  },
  qrLabel: {
    color: colors.primary,
    ...typography.eyebrow,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  qrGrid: {
    width: 126,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  qrPixel: {
    width: 22,
    height: 22,
    backgroundColor: "#F1E7E6",
  },
  qrPixelDark: {
    backgroundColor: colors.textPrimary,
  },
  qrHint: {
    color: colors.textSecondary,
    textAlign: "center",
    ...typography.caption,
  },
  summaryCard: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryTitle: {
    color: colors.textPrimary,
    ...typography.title,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: {
    color: colors.textSecondary,
    ...typography.body,
  },
  rowValue: {
    color: colors.textPrimary,
    ...typography.body,
  },
  strongText: {
    ...typography.title,
  },
  button: {
    marginTop: spacing["2xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
});
