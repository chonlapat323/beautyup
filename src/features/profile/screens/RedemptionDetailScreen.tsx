/**
 * RedemptionDetailScreen — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • ไม่ใช้ AppHeader — minimal header + breadcrumb
 * • Product card: gold top accent bar + gold points pill (แทน plain text)
 * • Status: เปลี่ยนจาก plain badge → Visual Timeline (4 steps)
 *   PENDING → PREPARING → SHIPPED → DELIVERED
 *   - done: gold dot + checkmark
 *   - active: gold ring + pulsing
 *   - pending: muted dot
 * • Tracking: เพิ่ม copy button, mono font, gold border box
 * • Address: icon header + divider, cleaner layout
 */

import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { CarrierBadge } from "@/components/ui/CarrierBadge";
import { CARRIERS } from "@/config/carriers";
import { CommerceImage } from "@/components/ui/CommerceImage";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetMyRedemption } from "@/services/api";
import type { MyRedemptionDetail } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type RedemptionStatus = MyRedemptionDetail["status"];

// ── Timeline steps ──────────────────────────────────────────
const TIMELINE_STEPS: { status: RedemptionStatus; label: string; icon: string; sub: string }[] = [
  { status: "PENDING",   label: "รอดำเนินการ",      icon: "hourglass-empty",  sub: "รับคำสั่งแลกแต้มแล้ว" },
  { status: "PREPARING", label: "กำลังเตรียมพัสดุ", icon: "inventory-2",      sub: "กำลังจัดเตรียมสินค้า" },
  { status: "SHIPPED",   label: "จัดส่งแล้ว",       icon: "local-shipping",   sub: "อยู่ระหว่างการจัดส่ง" },
  { status: "DELIVERED", label: "ส่งถึงแล้ว",        icon: "home",             sub: "ได้รับสินค้าแล้ว" },
];

const STATUS_ORDER: RedemptionStatus[] = ["PENDING", "PREPARING", "SHIPPED", "DELIVERED"];

function getStepState(stepStatus: RedemptionStatus, currentStatus: RedemptionStatus): "done" | "active" | "pending" {
  const stepIdx = STATUS_ORDER.indexOf(stepStatus);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export function RedemptionDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, "RedemptionDetail">>();
  const token = useAppStore((state) => state.token);
  const [detail, setDetail] = useState<MyRedemptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    mobileGetMyRedemption(token, route.params.redemptionId)
      .then(setDetail)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [token, route.params.redemptionId]);

  function formatDate(iso: string | null) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function handleCopy() {
    if (!detail?.trackingNumber) return;
    void Clipboard.setStringAsync(detail.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Screen contentContainerStyle={styles.content}>

      {/* ✦ Minimal page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>รายละเอียด{"\n"}ของรางวัล</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back-ios" size={12} color={colors.goldDeep} />
          <Text style={styles.backText}>ย้อนกลับ</Text>
        </Pressable>
      </View>

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        {[
          { label: "บัญชีของฉัน", onPress: () => navigation.navigate("ProfileHome") },
          { label: "ของรางวัลของฉัน", onPress: () => navigation.goBack() },
          { label: "รายละเอียด" },
        ].map((item, i, arr) => (
          <View key={i} style={styles.bcItem}>
            {item.onPress
              ? <Text style={styles.bcLink} onPress={item.onPress}>{item.label}</Text>
              : <Text style={styles.bcCur}>{item.label}</Text>
            }
            {i < arr.length - 1 && <Text style={styles.bcSep}>/</Text>}
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.gold} />
      ) : !detail ? (
        <View style={styles.empty}>
          <MaterialIcons name="inbox" size={36} color="rgba(255,255,255,0.25)" />
          <Text style={styles.emptyText}>ไม่พบข้อมูล</Text>
        </View>
      ) : (
        <>
          {/* ✦ Product card */}
          <View style={styles.productCard}>
            <View style={styles.productImgWrap}>
              <CommerceImage uri={detail.rewardProduct.imageUrl ?? undefined} style={styles.productImg} contentFit="cover" />
              <View style={styles.productImgAccent} />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{detail.rewardProduct.name}</Text>
              {/* ✦ Gold points pill */}
              <View style={styles.ptsPill}>
                <MaterialIcons name="auto-awesome" size={11} color={colors.gold} />
                <Text style={styles.ptsText}>ใช้ {detail.pointsSpent.toLocaleString()} แต้ม</Text>
              </View>
              <Text style={styles.productDate}>แลกเมื่อ {formatDate(detail.createdAt)}</Text>
            </View>
          </View>

          {/* ✦ Status Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>สถานะการจัดส่ง</Text>
            <View style={styles.timelineCard}>
              {TIMELINE_STEPS.map((step, i) => {
                const state = getStepState(step.status, detail.status);
                const isLast = i === TIMELINE_STEPS.length - 1;
                return (
                  <View key={step.status} style={styles.tlItem}>
                    {/* Connector line */}
                    {!isLast && (
                      <View style={[styles.tlLine, state === "done" && styles.tlLineDone]} />
                    )}
                    {/* Dot */}
                    <View style={[
                      styles.tlDot,
                      state === "done" && styles.tlDotDone,
                      state === "active" && styles.tlDotActive,
                      state === "pending" && styles.tlDotPending,
                    ]}>
                      <MaterialIcons
                        name={state === "done" ? "check" : step.icon as any}
                        size={12}
                        color={
                          state === "done" ? colors.goldDark :
                          state === "active" ? colors.gold :
                          "rgba(212,175,55,0.3)"
                        }
                      />
                    </View>
                    {/* Label */}
                    <View style={[styles.tlCopy, isLast && { paddingBottom: 0 }]}>
                      <Text style={[
                        styles.tlTitle,
                        state === "active" && styles.tlTitleActive,
                        state === "pending" && styles.tlTitlePending,
                      ]}>
                        {step.label}
                      </Text>
                      <Text style={[styles.tlSub, state === "active" && styles.tlSubActive]}>
                        {state === "active" ? "กำลังดำเนินการอยู่" :
                         state === "done" ? formatDate(detail.statusUpdatedAt) :
                         "รอดำเนินการ"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ✦ Tracking number */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>หมายเลขพัสดุ</Text>
            <View style={styles.trackingCard}>
              <View style={styles.trackingHeader}>
                {/* Carrier name */}
                {detail.carrierId ? (() => {
                  const carrier = CARRIERS.find((c) => c.id === detail.carrierId);
                  return carrier ? (
                    <CarrierBadge carrier={carrier} size="sm" showName />
                  ) : (
                    <Text style={styles.trackingTitle}>{detail.carrierId}</Text>
                  );
                })() : (
                  <Text style={styles.trackingTitle}>TRACKING NUMBER</Text>
                )}
                {detail.trackingNumber && (
                  <Pressable style={styles.copyBtn} onPress={handleCopy}>
                    <MaterialIcons name={copied ? "check" : "content-copy"} size={11} color={colors.goldDeep} />
                    <Text style={styles.copyBtnText}>{copied ? "คัดลอกแล้ว" : "คัดลอก"}</Text>
                  </Pressable>
                )}
              </View>
              {detail.trackingNumber ? (
                <Text style={styles.trackingNumber}>{detail.trackingNumber}</Text>
              ) : (
                <View style={styles.noTracking}>
                  <MaterialIcons name="access-time" size={15} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.noTrackingText}>ยังไม่มีหมายเลขพัสดุ</Text>
                </View>
              )}
            </View>
          </View>

          {/* Shipping address */}
          {detail.shippingRecipient && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ที่อยู่จัดส่ง</Text>
              <View style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressIconWrap}>
                    <MaterialIcons name="location-on" size={15} color={colors.goldDeep} />
                  </View>
                  <Text style={styles.addressHeaderText}>ที่อยู่จัดส่ง</Text>
                </View>
                <View style={styles.addressDivider} />
                <Text style={styles.addressName}>{detail.shippingRecipient}</Text>
                {detail.shippingPhone && (
                  <Text style={styles.addressSub}>{detail.shippingPhone}</Text>
                )}
                {detail.shippingAddress && (
                  <Text style={styles.addressSub}>{detail.shippingAddress}</Text>
                )}
              </View>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing["3xl"], backgroundColor: colors.background },

  // Header
  pageHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { color: "#fff", fontSize: 22, fontFamily: fonts.extraBold, lineHeight: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingTop: 6 },
  backText: { color: colors.goldDeep, fontSize: 12, fontFamily: fonts.semiBold },
  breadcrumb: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", paddingHorizontal: 18, paddingBottom: 14, gap: 4 },
  bcItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  bcLink: { color: colors.gold, fontSize: 10, fontFamily: fonts.semiBold },
  bcSep: { color: "rgba(255,255,255,0.3)", fontSize: 10 },
  bcCur: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: fonts.medium },

  loader: { marginTop: 40 },
  empty: { marginTop: 40, alignItems: "center", gap: 8 },
  emptyText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: fonts.medium },

  // Product card
  productCard: { marginHorizontal: 14, marginBottom: 14, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, overflow: "hidden", flexDirection: "row" },
  productImgWrap: { width: 100, height: 100, position: "relative", flexShrink: 0 },
  productImg: { width: 100, height: 100, backgroundColor: colors.surfaceMuted },
  productImgAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: colors.gold },
  productInfo: { flex: 1, padding: 12, gap: 6 },
  productName: { color: colors.textPrimary, fontSize: 13, fontFamily: fonts.bold, lineHeight: 18 },
  ptsPill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  ptsText: { color: colors.goldDeep, fontSize: 10, fontFamily: fonts.bold },
  productDate: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.medium },

  // Section
  section: { marginHorizontal: 14, marginBottom: 14 },
  sectionLabel: { color: "rgba(255,255,255,0.5)", fontSize: 8, fontFamily: fonts.bold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 9 },

  // Timeline
  timelineCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, padding: 14 },
  tlItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, position: "relative" },
  tlLine: { position: "absolute", left: 13, top: 26, width: 2, bottom: 0, backgroundColor: "rgba(212,175,55,0.15)" },
  tlLineDone: { backgroundColor: colors.gold },
  tlDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  tlDotDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  tlDotActive: { backgroundColor: colors.surface, borderColor: colors.gold, shadowColor: colors.gold, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 3 },
  tlDotPending: { backgroundColor: colors.surface, borderColor: "rgba(212,175,55,0.2)" },
  tlCopy: { flex: 1, paddingBottom: 16 },
  tlTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.textPrimary },
  tlTitleActive: { color: colors.goldDeep },
  tlTitlePending: { color: colors.textMuted },
  tlSub: { fontSize: 10, fontFamily: fonts.medium, color: colors.textMuted, marginTop: 2 },
  tlSubActive: { color: colors.gold },

  // Tracking
  trackingCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, padding: 14 },
  trackingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  trackingTitle: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.bold, letterSpacing: 0.8 },
  carrierPill: { backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: "rgba(212,175,55,0.35)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  carrierText: { color: colors.goldDeep, fontSize: 11, fontFamily: fonts.bold },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  copyBtnText: { color: colors.goldDeep, fontSize: 9, fontFamily: fonts.bold },
  trackingNumber: { color: colors.textPrimary, fontSize: 16, fontFamily: "JetBrainsMono_700Bold", letterSpacing: 1.5 },
  noTracking: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 6 },
  noTrackingText: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontFamily: fonts.medium },

  // Address
  addressCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, padding: 14 },
  addressHeader: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  addressIconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: "rgba(212,175,55,0.25)", alignItems: "center", justifyContent: "center" },
  addressHeaderText: { fontSize: 12, fontFamily: fonts.bold, color: colors.textPrimary },
  addressDivider: { height: 1, backgroundColor: colors.goldMuted, marginBottom: 10 },
  addressName: { fontSize: 14, fontFamily: fonts.bold, color: colors.textPrimary, marginBottom: 3 },
  addressSub: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSecondary, lineHeight: 18 },
});
