import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function OrderSuccessScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "OrderSuccess">>();

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="สั่งซื้อสำเร็จ"
          subtitle="ระบบได้รับการชำระเงินของคุณเรียบร้อยแล้ว"
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "ตะกร้าสินค้า", onPress: () => navigation.navigate("Cart") },
            { label: "ตรวจสอบคำสั่งซื้อ", onPress: () => navigation.navigate("Checkout") },
            { label: "สำเร็จ" },
          ]}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.label}>Order Confirmed</Text>
        <Text style={styles.title}>ขอบคุณสำหรับคำสั่งซื้อ</Text>
        <Text style={styles.subtitle}>เลขที่คำสั่งซื้อ: {route.params.orderId}</Text>
        <Text style={styles.caption}>ทีมงานได้รับรายการแล้ว และกำลังเตรียมสินค้าสำหรับจัดส่ง</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => navigateToHome(navigation)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>กลับหน้าแรก</Text>
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
          <Text style={styles.secondaryText}>ดูคำสั่งซื้อ</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: spacing.lg,
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
