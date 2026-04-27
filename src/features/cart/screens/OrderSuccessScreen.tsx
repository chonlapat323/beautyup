import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function OrderSuccessScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "OrderSuccess">>();

  return (
    <Screen contentContainerStyle={styles.content}>
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigateToHome(navigation) },
          { label: "Cart", onPress: () => navigation.navigate("Cart") },
          { label: "Checkout", onPress: () => navigation.navigate("Checkout") },
          { label: "Success" },
        ]}
      />
      <View style={styles.hero}>
        <Text style={styles.label}>Order confirmed</Text>
        <Text style={styles.title}>Thank you for your order</Text>
        <Text style={styles.subtitle}>Order ID: {route.params.orderId}</Text>
        <Text style={styles.caption}>Your payment was received and the order is now being prepared.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => navigateToHome(navigation)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Back to home</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            (navigation.getParent() as any)?.navigate("Profile", {
              screen: "OrderDetail",
              params: { orderId: route.params.orderId },
            })
          }
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>View orders</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
    gap: spacing["2xl"],
  },
  hero: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["3xl"],
    gap: spacing.md,
  },
  label: {
    color: colors.primary,
    ...typography.eyebrow,
  },
  title: {
    color: colors.textPrimary,
    ...typography.headline,
  },
  subtitle: {
    color: colors.textSecondary,
    ...typography.body,
  },
  caption: {
    color: colors.textMuted,
    ...typography.caption,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    ...typography.title,
  },
  secondaryButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.primaryStrong,
    ...typography.title,
  },
});
