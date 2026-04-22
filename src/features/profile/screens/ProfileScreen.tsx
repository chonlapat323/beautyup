import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAppStore } from "@/store/useAppStore";
import type { ProfileStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const member = useAppStore((state) => state.member);
  const orders = useAppStore((state) => state.orders);
  const signOut = useAppStore((state) => state.signOut);

  const totalSpend = orders.reduce((s, o) => s + o.total, 0);
  const memberTypeLabel = member?.memberType === "SALON" ? "Salon Member" : "Regular Member";

  if (!isAuthenticated) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <View style={styles.guestBrand}>
          <BrandLockup size="hero" />
          <Text style={styles.guestTitle}>ยินดีต้อนรับสู่ Beauty Up</Text>
          <Text style={styles.guestSubtitle}>
            เข้าสู่ระบบเพื่อติดตามออเดอร์ สะสมแต้ม และประสบการณ์ที่ดียิ่งขึ้น
          </Text>
        </View>

        <View style={styles.guestActions}>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.primaryButtonText}>เข้าสู่ระบบ</Text>
          </Pressable>
          <Pressable style={styles.outlineButton} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.outlineButtonText}>สมัครสมาชิก</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader title="Profile" subtitle="จัดการบัญชีและติดตามออเดอร์ของคุณ" />

      <View style={styles.card}>
        <Text style={styles.name}>{member?.fullName ?? "-"}</Text>
        <Text style={styles.meta}>{memberTypeLabel}</Text>
        <Text style={styles.identifier}>{member?.email ?? member?.phone ?? ""}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>ออเดอร์ทั้งหมด</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{member?.pointBalance ?? 0}</Text>
            <Text style={styles.statLabel}>แต้มสะสม</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>฿{totalSpend.toLocaleString("th-TH", { maximumFractionDigits: 0 })}</Text>
            <Text style={styles.statLabel}>ยอดซื้อรวม</Text>
          </View>
        </View>

        <Pressable onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>ออกจากระบบ</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  guestBrand: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing["3xl"],
    alignItems: "center",
    gap: spacing.md,
  },
  guestTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.md,
  },
  guestSubtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
    ...typography.body,
  },
  guestActions: {
    paddingHorizontal: spacing["2xl"],
    marginTop: spacing["3xl"],
    gap: spacing.md,
  },
  primaryButton: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
  outlineButton: {
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: colors.primary,
    ...typography.title,
  },
  card: {
    marginHorizontal: spacing["2xl"],
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing["2xl"],
    gap: spacing.sm,
  },
  name: {
    color: colors.textPrimary,
    ...typography.headline,
  },
  meta: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: "600",
  },
  identifier: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "center",
  },
  statValue: {
    color: colors.textPrimary,
    ...typography.title,
    fontSize: 14,
  },
  statLabel: {
    color: colors.textSecondary,
    ...typography.caption,
    textAlign: "center",
    fontSize: 10,
  },
  signOutButton: {
    marginTop: spacing.lg,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  signOutText: {
    color: colors.textSecondary,
    ...typography.title,
  },
});
