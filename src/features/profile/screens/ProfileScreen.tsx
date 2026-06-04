/**
 * ProfileScreen — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • ไม่ใช้ AppHeader — hero section บนพื้น jade green แทน
 * • Hero: avatar (gold ring ใหญ่ขึ้น), ชื่อ, member type badge, email
 * • Stats row: gold value, semi-transparent cards บน green bg
 * • Points + Credit รวมใน card เดียว (แทน card แยก) — ประหยัดพื้นที่
 * • Points pill: gold icon + gold text
 * • Referral card: gold code text, copy/share buttons gold
 * • Bank card: compact header + detail
 * • Menu items: icon list (แทน full-width buttons) + gold chevron
 *   → ดูเหมือน settings page มาตรฐาน อ่านง่ายขึ้น
 * • Sign out: subtle text row (แทน button เต็มความกว้าง)
 * • Tab bar: fixed + rounded top
 */

import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { AppModal } from "@/components/ui/AppModal";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { navigateToHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetCommissionSummary, mobileUploadProfileImage } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type MenuItemProps = {
  icon: string;
  label: string;
  badge?: string;
  onPress: () => void;
  danger?: boolean;
};

function MenuItem({ icon, label, badge, onPress, danger }: MenuItemProps) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <MaterialIcons
          name={icon as any}
          size={16}
          color={danger ? "#DC2626" : colors.goldDeep}
        />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {badge && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      {!danger && (
        <MaterialIcons name="chevron-right" size={18} color={colors.gold} />
      )}
    </Pressable>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const member = useAppStore((state) => state.member);
  const token = useAppStore((state) => state.token);
  const orders = useAppStore((state) => state.orders);
  const signOut = useAppStore((state) => state.signOut);
  const refreshProfile = useAppStore((state) => state.refreshProfile);

  useFocusEffect(useCallback(() => { void refreshProfile(); }, [refreshProfile]));

  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [commission, setCommission] = useState<{
    pendingAmount: number; pendingCount: number;
    paidAmount: number; paidCount: number;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    mobileGetCommissionSummary(token).then(setCommission).catch(() => null);
  }, [token]);

  async function handlePickProfileImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setPhotoError("กรุณาอนุญาตให้เข้าถึงคลังรูปภาพในการตั้งค่า");
      return;
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    if (!token) return;
    setUploadingPhoto(true);
    try {
      await mobileUploadProfileImage(token, result.assets[0].uri);
      await refreshProfile();
    } catch {
      setPhotoError("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploadingPhoto(false);
    }
  }

  const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
  const memberTypeLabel = member?.memberType === "SALON" ? "สมาชิกซาลอน" : "สมาชิกทั่วไป";
  const initials = member?.fullName?.trim().charAt(0).toUpperCase() ?? "B";

  // ── Guest screen ────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <View style={styles.guestWrap}>
          <BrandLockup size="hero" />
          <Text style={styles.guestTitle}>ยินดีต้อนรับสู่ Beauty Up</Text>
          <Text style={styles.guestSub}>เข้าสู่ระบบเพื่อติดตามออเดอร์ สะสมแต้ม และใช้งานบัญชีได้เต็มรูปแบบ</Text>
        </View>
        <View style={styles.guestActions}>
          <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.primaryBtnText}>เข้าสู่ระบบ</Text>
          </Pressable>
          <Pressable style={styles.outlineBtn} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.outlineBtnText}>สมัครสมาชิก</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  // ── Authenticated screen ─────────────────────────────────
  return (
    <Screen contentContainerStyle={styles.content}>

      <AppModal
        visible={photoError !== null}
        type="error"
        title="อัปโหลดรูปไม่สำเร็จ"
        message={photoError ?? ""}
        confirmLabel="ตกลง"
        onConfirm={() => setPhotoError(null)}
      />

      {/* ✦ Hero — avatar + name + type + email */}
      <View style={styles.hero}>
        <Pressable style={styles.avatarShell} onPress={handlePickProfileImage} disabled={uploadingPhoto}>
          {member?.profileImageUrl ? (
            <Image source={{ uri: member.profileImageUrl }} style={{ width: 56, height: 56, borderRadius: 28 }} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <MaterialIcons name={uploadingPhoto ? "hourglass-empty" : "camera-alt"} size={10} color="#fff" />
          </View>
        </Pressable>
        <Text style={styles.heroName}>{member?.fullName ?? "-"}</Text>
        <View style={styles.typeBadge}>
          <MaterialIcons name="auto-awesome" size={10} color={colors.goldDark} />
          <Text style={styles.typeText}>{memberTypeLabel}</Text>
        </View>
        <Text style={styles.heroEmail}>{member?.email ?? member?.phone ?? ""}</Text>
      </View>

      {/* ✦ Stats row */}
      <View style={styles.statsRow}>
        {[
          { val: String(orders.length), label: "ออเดอร์ทั้งหมด" },
          { val: String(member?.pointBalance ?? 0), label: "แต้มสะสม" },
          { val: `฿${totalSpend.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`, label: "ยอดซื้อรวม" },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statVal} numberOfLines={1}>{stat.val}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ✦ Points + Credit card */}
      <View style={styles.ptsCard}>
        {/* Points row */}
        <View style={styles.ptsRow}>
          <View style={styles.ptsLeft}>
            <View style={styles.ptsIcon}>
              <MaterialIcons name="auto-awesome" size={16} color={colors.gold} />
            </View>
            <View>
              <Text style={styles.ptsNum}>{(member?.pointBalance ?? 0).toLocaleString("th-TH")} แต้ม</Text>
              <Text style={styles.ptsSub}>แต้มสะสมปัจจุบัน</Text>
            </View>
          </View>
          <Pressable onPress={() => navigation.navigate("Rewards")} style={styles.ptsPrimaryBtn}>
            <Text style={styles.ptsPrimaryBtnText}>แลกแต้ม</Text>
          </Pressable>
        </View>

        {(member?.creditBalance ?? 0) >= 0 && (
          <>
            <View style={styles.cardDivider} />
            {/* Credit row */}
            <View style={styles.creditRow}>
              <View>
                <Text style={styles.creditLabel}>เครดิตคงเหลือ</Text>
                <Text style={styles.creditVal}>
                  ฿{(member?.creditBalance ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.creditBtns}>
                <Pressable style={styles.creditBtn} onPress={() => navigation.navigate("CreditHistory")}>
                  <Text style={styles.creditBtnText}>ประวัติ</Text>
                </Pressable>
                <Pressable style={[styles.creditBtn, styles.creditBtnFill]} onPress={() => navigation.navigate("Withdrawal")}>
                  <Text style={[styles.creditBtnText, styles.creditBtnFillText]}>ถอน</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>

      {/* ✦ Commission */}
      {commission && commission.paidAmount > 0 && (
        <View style={styles.commCard}>
          <View style={styles.commRow}>
            <View style={styles.commIcon}>
              <MaterialIcons name="trending-up" size={15} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.commLabel}>คอมมิชชันที่ได้รับทั้งหมด</Text>
              <Text style={styles.commVal}>
                ฿{commission.paidAmount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                <Text style={styles.commSub}> ({commission.paidCount} รายการ)</Text>
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ✦ Referral card */}
      {member?.referralCode && (
        <View style={styles.refCard}>
          <Text style={styles.refLabel}>รหัสแนะนำของคุณ</Text>
          <Text style={styles.refCode}>{member.referralCode}</Text>
          <View style={styles.refBtns}>
            <Pressable
              style={styles.refBtn}
              onPress={() => {
                void Clipboard.setStringAsync(member.referralCode ?? "");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              <MaterialIcons name={copied ? "check" : "content-copy"} size={13} color={colors.goldDeep} />
              <Text style={styles.refBtnText}>{copied ? "คัดลอกแล้ว" : "คัดลอก"}</Text>
            </Pressable>
            <Pressable
              style={[styles.refBtn, styles.refBtnFill]}
              onPress={() => void Share.share({ message: `ใช้รหัสแนะนำของฉัน ${member.referralCode} สมัคร Beauty Up รับสิทธิพิเศษได้เลย` })}
            >
              <MaterialIcons name="share" size={13} color={colors.goldDark} />
              <Text style={[styles.refBtnText, styles.refBtnFillText]}>แชร์</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ✦ Bank account */}
      <View style={styles.bankCard}>
        <View style={styles.bankHeader}>
          <Text style={styles.bankTitle}>บัญชีธนาคาร</Text>
          <Pressable onPress={() => navigation.navigate("BankAccount")}>
            <Text style={styles.bankEdit}>แก้ไข</Text>
          </Pressable>
        </View>
        {member?.bankName ? (
          <>
            <Text style={styles.bankName}>{member.bankName}</Text>
            <Text style={styles.bankSub}>{member.bankAccountNumber} · {member.bankAccountName}</Text>
          </>
        ) : (
          <Pressable onPress={() => navigation.navigate("BankAccount")}>
            <Text style={styles.bankEmpty}>ยังไม่มีบัญชี — แตะเพื่อเพิ่ม</Text>
          </Pressable>
        )}
      </View>

      {/* ✦ Menu items */}
      <View style={styles.menuCard}>
        <MenuItem icon="card-giftcard" label="ของรางวัลของฉัน" onPress={() => navigation.navigate("MyRedemptions")} />
        <MenuItem icon="receipt-long" label="ประวัติคำสั่งซื้อ" onPress={() => navigation.navigate("OrderHistory")} />
        <MenuItem icon="location-on" label="ที่อยู่ของฉัน" onPress={() => navigation.navigate("Addresses")} />
        <MenuItem icon="history" label="ประวัติเครดิต" onPress={() => navigation.navigate("CreditHistory")} />
      </View>

      {/* ✦ Sign out — subtle */}
      <Pressable style={styles.signOut} onPress={signOut}>
        <MaterialIcons name="logout" size={15} color="rgba(255,255,255,0.35)" />
        <Text style={styles.signOutText}>ออกจากระบบ</Text>
      </Pressable>

    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 48, backgroundColor: colors.background },

  // Guest
  guestWrap: { paddingHorizontal: 24, paddingTop: 40, alignItems: "center", gap: 10 },
  guestTitle: { color: "#fff", fontSize: 20, fontFamily: fonts.bold, textAlign: "center", marginTop: 8 },
  guestSub: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: fonts.medium, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  guestActions: { paddingHorizontal: 24, marginTop: 32, gap: 12 },
  primaryBtn: { height: 54, borderRadius: radius.pill, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: colors.goldDark, fontSize: 16, fontFamily: fonts.bold },
  outlineBtn: { height: 54, borderRadius: radius.pill, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  outlineBtnText: { color: "#fff", fontSize: 16, fontFamily: fonts.semiBold },

  // Hero
  hero: { alignItems: "center", paddingTop: 20, paddingBottom: 18, gap: 4 },
  avatarShell: { width: 74, height: 74, borderRadius: 37, borderWidth: 2.5, borderColor: colors.gold, backgroundColor: colors.goldSoft, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.gold, alignItems: "center", justifyContent: "center" },
  avatarEditBadge: { position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.gold, fontSize: 22, fontFamily: fonts.bold },
  heroName: { color: "#fff", fontSize: 20, fontFamily: fonts.extraBold },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 2 },
  typeText: { color: colors.goldDark, fontSize: 12, fontFamily: fonts.bold },
  heroEmail: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: fonts.medium, marginTop: 2 },

  // Stats
  statsRow: { flexDirection: "row", gap: 8, marginHorizontal: 16, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, borderWidth: 1, borderColor: colors.goldMuted, padding: 10, alignItems: "center", gap: 3 },
  statVal: { color: colors.gold, fontSize: 15, fontFamily: fonts.extraBold },
  statLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: fonts.medium, textAlign: "center", lineHeight: 15 },

  // Points + Credit card
  ptsCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, padding: 14 },
  ptsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ptsLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  ptsIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold, alignItems: "center", justifyContent: "center" },
  ptsNum: { color: colors.goldDeep, fontSize: 16, fontFamily: fonts.extraBold },
  ptsSub: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium, marginTop: 1 },
  ptsPrimaryBtn: { backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  ptsPrimaryBtnText: { color: colors.goldDark, fontSize: 13, fontFamily: fonts.bold },
  cardDivider: { height: 1, backgroundColor: colors.goldMuted, marginVertical: 11 },
  creditRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  creditLabel: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium },
  creditVal: { color: colors.primary, fontSize: 17, fontFamily: fonts.extraBold, marginTop: 1 },
  creditBtns: { flexDirection: "row", gap: 7 },
  creditBtn: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.primary },
  creditBtnFill: { backgroundColor: colors.primary, borderColor: colors.primary },
  creditBtnText: { color: colors.primary, fontSize: 12, fontFamily: fonts.bold },
  creditBtnFillText: { color: "#fff" },

  // Commission
  commCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: "rgba(124,58,237,0.2)", padding: 12 },
  commRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  commIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F5F0FF", alignItems: "center", justifyContent: "center" },
  commLabel: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium },
  commVal: { color: "#5B3FA0", fontSize: 15, fontFamily: fonts.bold, marginTop: 1 },
  commSub: { color: "#7A5CB8", fontSize: 12, fontFamily: fonts.medium },

  // Referral
  refCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, padding: 14 },
  refLabel: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bold, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 },
  refCode: { color: colors.goldDeep, fontSize: 20, fontFamily: fonts.extraBold, letterSpacing: 3, marginBottom: 11 },
  refBtns: { flexDirection: "row", gap: 8 },
  refBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 11, paddingVertical: 8, borderWidth: 1, borderColor: colors.goldMuted, backgroundColor: colors.goldSoft },
  refBtnFill: { backgroundColor: colors.gold, borderColor: colors.gold },
  refBtnText: { color: colors.goldDeep, fontSize: 13, fontFamily: fonts.bold },
  refBtnFillText: { color: colors.goldDark },

  // Bank
  bankCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, padding: 13 },
  bankHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
  bankTitle: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.bold, textTransform: "uppercase", letterSpacing: 0.6 },
  bankEdit: { color: colors.goldDeep, fontSize: 13, fontFamily: fonts.bold },
  bankName: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.bold },
  bankSub: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium, marginTop: 2 },
  bankEmpty: { color: colors.primary, fontSize: 13, fontFamily: fonts.medium },

  // Menu
  menuCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.goldMuted },
  menuIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.goldSoft, alignItems: "center", justifyContent: "center" },
  menuIconDanger: { backgroundColor: "#FEE2E2" },
  menuLabel: { flex: 1, color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semiBold },
  menuLabelDanger: { color: "#DC2626" },
  menuBadge: { backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4 },
  menuBadgeText: { color: colors.goldDark, fontSize: 11, fontFamily: fonts.bold },

  // Sign out
  signOut: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, marginBottom: 8 },
  signOutText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: fonts.semiBold },
});
