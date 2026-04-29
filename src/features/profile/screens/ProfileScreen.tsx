import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { AppHeader } from "@/components/ui/AppHeader";
import { navigateToHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetCommissionSummary } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const member = useAppStore((state) => state.member);
  const token = useAppStore((state) => state.token);
  const orders = useAppStore((state) => state.orders);
  const signOut = useAppStore((state) => state.signOut);

  const [commission, setCommission] = useState<{
    pendingAmount: number;
    pendingCount: number;
    paidAmount: number;
    paidCount: number;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    mobileGetCommissionSummary(token)
      .then(setCommission)
      .catch(() => null);
  }, [token]);

  const totalSpend = orders.reduce((sum, order) => sum + order.total, 0);
  const memberTypeLabel = member?.memberType === "SALON" ? "Salon Member" : "Regular Member";

  if (!isAuthenticated) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <View style={styles.guestBrand}>
          <BrandLockup size="hero" />
          <Text style={styles.guestTitle}>ยินดีต้อนรับสู่ Beauty Up</Text>
          <Text style={styles.guestSubtitle}>
            เข้าสู่ระบบเพื่อติดตามออเดอร์ สะสมแต้ม และใช้งานบัญชีของคุณได้เต็มรูปแบบ
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
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="บัญชีของฉัน"
          subtitle="จัดการข้อมูลส่วนตัวและติดตามคำสั่งซื้อ"
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "บัญชีของฉัน" },
          ]}
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.name}>{member?.fullName ?? "-"}</Text>
        <Text style={styles.meta}>{memberTypeLabel}</Text>
        <Text style={styles.identifier}>{member?.email ?? member?.phone ?? ""}</Text>

        {member?.referralCode ? (
          <Pressable
            style={styles.referralBox}
            onPress={() =>
              void Share.share({
                message: `ใช้รหัสแนะนำของฉัน ${member.referralCode} สมัคร Beauty Up รับสิทธิพิเศษได้เลย`,
              })
            }
          >
            <Text style={styles.referralLabel}>รหัสแนะนำของคุณ</Text>
            <Text style={styles.referralCode}>{member.referralCode}</Text>
            <Text style={styles.referralHint}>แตะเพื่อแชร์</Text>
          </Pressable>
        ) : null}

        {commission && (commission.pendingAmount > 0 || commission.paidAmount > 0) ? (
          <View style={styles.commissionBox}>
            <Text style={styles.commissionTitle}>Commission ของคุณ</Text>
            <View style={styles.commissionRow}>
              <View style={styles.commissionItem}>
                <Text style={styles.commissionAmount}>
                  ฿{commission.pendingAmount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                </Text>
                <Text style={styles.commissionLabel}>รอจ่าย ({commission.pendingCount})</Text>
              </View>
              <View style={styles.commissionDivider} />
              <View style={styles.commissionItem}>
                <Text style={styles.commissionAmount}>
                  ฿{commission.paidAmount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                </Text>
                <Text style={styles.commissionLabel}>จ่ายแล้ว ({commission.paidCount})</Text>
              </View>
            </View>
          </View>
        ) : null}

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
            <Text style={styles.statValue}>
              ฿{totalSpend.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.statLabel}>ยอดซื้อรวม</Text>
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate("OrderHistory")} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>ประวัติคำสั่งซื้อ</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Addresses")} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>ที่อยู่ของฉัน</Text>
        </Pressable>

        <Pressable onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>ออกจากระบบ</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
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
  referralBox: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#F0FAF4",
    borderWidth: 1,
    borderColor: "#B7DDC7",
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  referralLabel: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  referralCode: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
  },
  referralHint: {
    color: colors.textMuted,
    ...typography.caption,
  },
  commissionBox: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#F5F0FF",
    borderWidth: 1,
    borderColor: "#DDD0F5",
    padding: spacing.md,
    gap: spacing.sm,
  },
  commissionTitle: {
    color: "#5B3FA0",
    ...typography.caption,
    fontWeight: "600",
  },
  commissionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commissionItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  commissionDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#DDD0F5",
  },
  commissionAmount: {
    color: "#3D2875",
    fontSize: 16,
    fontWeight: "700",
  },
  commissionLabel: {
    color: "#7A5CB8",
    ...typography.caption,
    fontSize: 10,
  },
  menuButton: {
    marginTop: spacing.lg,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.background,
  },
  menuButtonText: {
    color: colors.textPrimary,
    ...typography.title,
  },
  signOutButton: {
    marginTop: spacing.sm,
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
