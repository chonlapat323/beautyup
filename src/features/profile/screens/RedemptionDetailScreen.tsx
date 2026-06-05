/**
 * RedemptionDetailScreen — v3 Design Proposal
 * (เพิ่มจาก v2: Carrier section)
 *
 * การเปลี่ยนแปลงจาก v2:
 * ─────────────────────
 * • Tracking section เปลี่ยนจาก plain card → 2-part card:
 *   ┌─ Carrier row ────────────────────────────────────────┐
 *   │  [Logo/Icon] CarrierName · ผู้ให้บริการขนส่ง  [status]│
 *   ├─ Tracking number ────────────────────────────────────┤
 *   │  TRACKING NUMBER label        [คัดลอก btn]           │
 *   │  TH123456789 (mono font)                             │
 *   │  กดคัดลอกเพื่อติดตามพัสดุ                             │
 *   └──────────────────────────────────────────────────────┘
 * • Carrier map: carrierId → { name, color, shortName }
 * • Status dot บน carrier card แสดง "ระหว่างทาง" เมื่อ SHIPPED
 * • Timeline: done steps แสดง connector สีทอง
 * • Section label รวม: "ข้อมูลการจัดส่ง" (แทน "หมายเลขพัสดุ")
 */

import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage } from "@/components/ui/CommerceImage";
import type { ProfileStackParamList } from "@/navigation/types";
import { mobileGetMyRedemption } from "@/services/api";
import type { MyRedemptionDetail } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type RedemptionStatus = MyRedemptionDetail["status"];

// static fallback for old orders that stored shortName as carrierId
const CARRIER_MAP: Record<string, { name: string; shortName: string; color: string; textColor: string }> = {
  "thpost":   { name: "ไปรษณีย์ไทย",  shortName: "ไปรษณีย์", color: "#C8102E", textColor: "#fff" },
  "kerry":    { name: "Kerry Express", shortName: "Kerry",    color: "#FF6B00", textColor: "#fff" },
  "flash":    { name: "Flash Express", shortName: "Flash",    color: "#E50012", textColor: "#fff" },
  "jnt":      { name: "J&T Express",   shortName: "J&T",      color: "#E4231F", textColor: "#fff" },
  "dhl":      { name: "DHL Express",   shortName: "DHL",      color: "#FFCC00", textColor: "#CC0000" },
};

// ── Status badge for carrier ────────────────────────────────
// ── Timeline steps ──────────────────────────────────────────
const TIMELINE_STEPS: { status: RedemptionStatus; label: string; icon: string }[] = [
  { status: "PENDING",   label: "รอดำเนินการ",      icon: "hourglass-empty"  },
  { status: "PREPARING", label: "กำลังเตรียมพัสดุ", icon: "inventory-2"      },
  { status: "SHIPPED",   label: "จัดส่งแล้ว",        icon: "local-shipping"   },
  { status: "DELIVERED", label: "ส่งถึงแล้ว",        icon: "home"             },
];

const STATUS_ORDER: RedemptionStatus[] = ["PENDING", "PREPARING", "SHIPPED", "DELIVERED"];

function getStepState(stepStatus: RedemptionStatus, currentStatus: RedemptionStatus) {
  const si = STATUS_ORDER.indexOf(stepStatus);
  const ci = STATUS_ORDER.indexOf(currentStatus);
  return si < ci ? "done" : si === ci ? "active" : "pending";
}

export function RedemptionDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, "RedemptionDetail">>();
  const token = useAppStore((state) => state.token);
  const storeCarriers = useAppStore((state) => state.carriers);
  const [detail, setDetail] = useState<MyRedemptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  function getCarrier(carrierId: string | null) {
    if (!carrierId) return null;
    const byId = storeCarriers.find((c) => c.id === carrierId);
    if (byId) return byId;
    const byShort = storeCarriers.find((c) => c.shortName.toLowerCase() === carrierId.toLowerCase());
    if (byShort) return byShort;
    return CARRIER_MAP[carrierId.toLowerCase()] ?? {
      name: carrierId,
      shortName: carrierId.slice(0, 4).toUpperCase(),
      color: colors.primary,
      textColor: "#fff",
    };
  }

  function getCarrierStatusLabel(status: RedemptionStatus): string | null {
    if (status === "SHIPPED")   return "ระหว่างทาง";
    if (status === "DELIVERED") return "ส่งถึงแล้ว";
    return null;
  }

  useEffect(() => {
    if (!token) return;
    mobileGetMyRedemption(token, route.params.redemptionId)
      .then(setDetail).catch(() => null).finally(() => setLoading(false));
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

  const carrier = detail ? getCarrier(detail.carrierId) : null;
  const carrierStatusLabel = detail ? getCarrierStatusLabel(detail.status) : null;
  const showTrackingSection = carrier || detail?.trackingNumber;

  return (
    <Screen contentContainerStyle={styles.content}>

      {/* Minimal header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{"รายละเอียด\nของรางวัล"}</Text>
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
          {/* Product card */}
          <View style={styles.productCard}>
            <View style={styles.productImgWrap}>
              <CommerceImage uri={detail.rewardProduct.imageUrl ?? undefined} style={styles.productImg} contentFit="cover" />
              <View style={styles.productImgAccent} />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{detail.rewardProduct.name}</Text>
              <View style={styles.ptsPill}>
                <MaterialIcons name="auto-awesome" size={11} color={colors.gold} />
                <Text style={styles.ptsText}>ใช้ {detail.pointsSpent.toLocaleString()} แต้ม</Text>
              </View>
              <Text style={styles.productDate}>แลกเมื่อ {formatDate(detail.createdAt)}</Text>
            </View>
          </View>

          {/* Status timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>สถานะการจัดส่ง</Text>
            <View style={styles.timelineCard}>
              {TIMELINE_STEPS.map((step, i) => {
                const state = getStepState(step.status, detail.status);
                const isLast = i === TIMELINE_STEPS.length - 1;
                const isDoneConnector = state === "done";
                return (
                  <View key={step.status} style={styles.tlItem}>
                    {!isLast && (
                      <View style={[styles.tlLine, isDoneConnector && styles.tlLineDone]} />
                    )}
                    <View style={[
                      styles.tlDot,
                      state === "done" && styles.tlDotDone,
                      state === "active" && styles.tlDotActive,
                    ]}>
                      <MaterialIcons
                        name={state === "done" ? "check" : step.icon as any}
                        size={11}
                        color={state === "done" ? colors.goldDark : state === "active" ? colors.gold : "rgba(212,175,55,0.25)"}
                      />
                    </View>
                    <View style={[styles.tlCopy, isLast && { paddingBottom: 0 }]}>
                      <Text style={[
                        styles.tlTitle,
                        state === "active" && styles.tlTitleActive,
                        state === "pending" && styles.tlTitlePending,
                      ]}>
                        {step.label}
                      </Text>
                      <Text style={[styles.tlSub, state === "active" && styles.tlSubActive]}>
                        {state === "done"   ? formatDate(detail.statusUpdatedAt) :
                         state === "active" ? "กำลังดำเนินการอยู่" : "รอดำเนินการ"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ✦ Tracking + Carrier card */}
          {showTrackingSection && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ข้อมูลการจัดส่ง</Text>
              <View style={styles.trackingCard}>

                {/* ✦ Carrier row */}
                {carrier && (
                  <View style={styles.carrierRow}>
                    {/* Logo */}
                    <View style={styles.carrierLogoWrap}>
                      <View style={[styles.carrierLogoFallback, { backgroundColor: carrier.color }]}>
                        <Text style={[styles.carrierLogoText, { color: carrier.textColor }]}>
                          {carrier.shortName}
                        </Text>
                      </View>
                    </View>

                    {/* Name */}
                    <View style={styles.carrierInfo}>
                      <Text style={styles.carrierName}>{carrier.name}</Text>
                      <Text style={styles.carrierSub}>ผู้ให้บริการขนส่ง</Text>
                    </View>

                    {/* ✦ Status dot */}
                    {carrierStatusLabel && (
                      <View style={styles.carrierStatus}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{carrierStatusLabel}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Tracking number */}
                <View style={styles.trackingBody}>
                  <View style={styles.trackingHeader}>
                    <Text style={styles.trackingLabel}>TRACKING NUMBER</Text>
                    {detail.trackingNumber && (
                      <Pressable style={styles.copyBtn} onPress={handleCopy}>
                        <MaterialIcons name={copied ? "check" : "content-copy"} size={11} color={colors.goldDeep} />
                        <Text style={styles.copyBtnText}>{copied ? "คัดลอกแล้ว" : "คัดลอก"}</Text>
                      </Pressable>
                    )}
                  </View>

                  {detail.trackingNumber ? (
                    <>
                      <Text style={styles.trackingNumber}>{detail.trackingNumber}</Text>
                      <Text style={styles.trackingHint}>กดคัดลอกเพื่อติดตามพัสดุ</Text>
                    </>
                  ) : (
                    <View style={styles.noTracking}>
                      <MaterialIcons name="access-time" size={14} color="rgba(0,0,0,0.25)" />
                      <Text style={styles.noTrackingText}>ยังไม่มีหมายเลขพัสดุ</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

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
                {detail.shippingPhone && <Text style={styles.addressSub}>{detail.shippingPhone}</Text>}
                {detail.shippingAddress && <Text style={styles.addressSub}>{detail.shippingAddress}</Text>}
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

  // Product
  productCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, overflow: "hidden", flexDirection: "row" },
  productImgWrap: { width: 92, height: 92, position: "relative", flexShrink: 0 },
  productImg: { width: 92, height: 92, backgroundColor: colors.surfaceMuted },
  productImgAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: colors.gold },
  productInfo: { flex: 1, padding: 12, gap: 6 },
  productName: { color: colors.textPrimary, fontSize: 13, fontFamily: fonts.bold, lineHeight: 18 },
  ptsPill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  ptsText: { color: colors.goldDeep, fontSize: 10, fontFamily: fonts.bold },
  productDate: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.medium },

  // Section
  section: { marginHorizontal: 14, marginBottom: 12 },
  sectionLabel: { color: "rgba(255,255,255,0.5)", fontSize: 8, fontFamily: fonts.bold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 9 },

  // Timeline
  timelineCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, padding: 14 },
  tlItem: { flexDirection: "row", alignItems: "flex-start", gap: 9, position: "relative" },
  tlLine: { position: "absolute", left: 11, top: 23, width: 2, bottom: 0, backgroundColor: "rgba(212,175,55,0.18)" },
  tlLineDone: { backgroundColor: colors.gold },
  tlDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "rgba(212,175,55,0.2)", backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  tlDotDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  tlDotActive: { borderColor: colors.gold, shadowColor: colors.gold, shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 2 },
  tlCopy: { flex: 1, paddingBottom: 14 },
  tlTitle: { fontSize: 12, fontFamily: fonts.bold, color: colors.textPrimary },
  tlTitleActive: { color: colors.goldDeep },
  tlTitlePending: { color: colors.textMuted },
  tlSub: { fontSize: 9, fontFamily: fonts.medium, color: colors.textMuted, marginTop: 2 },
  tlSubActive: { color: colors.gold },

  // ✦ Tracking + Carrier card
  trackingCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, overflow: "hidden" },

  // Carrier row
  carrierRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderBottomWidth: 1,
    borderBottomColor: "rgba(212,175,55,0.12)",
    backgroundColor: "rgba(212,175,55,0.025)",
  },
  carrierLogoWrap: { width: 46, height: 46, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(212,175,55,0.2)", alignItems: "center", justifyContent: "center", flexShrink: 0, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  carrierLogoFallback: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  carrierLogoText: { fontSize: 9, fontFamily: fonts.extraBold, letterSpacing: -0.3 },
  carrierInfo: { flex: 1 },
  carrierName: { fontSize: 14, fontFamily: fonts.bold, color: colors.textPrimary },
  carrierSub: { fontSize: 9, fontFamily: fonts.medium, color: colors.textMuted, marginTop: 1 },
  carrierStatus: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold },
  statusText: { fontSize: 9, fontFamily: fonts.bold, color: colors.goldDeep },

  // Tracking body
  trackingBody: { padding: 12 },
  trackingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  trackingLabel: { color: colors.textMuted, fontSize: 8, fontFamily: fonts.bold, letterSpacing: 1 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  copyBtnText: { color: colors.goldDeep, fontSize: 9, fontFamily: fonts.bold },
  trackingNumber: { color: colors.textPrimary, fontSize: 18, fontFamily: "JetBrainsMono_700Bold", letterSpacing: 2 },
  trackingHint: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.medium, marginTop: 3 },
  noTracking: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 4 },
  noTrackingText: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.medium },

  // Address
  addressCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.goldMuted, padding: 14 },
  addressHeader: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  addressIconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: "rgba(212,175,55,0.25)", alignItems: "center", justifyContent: "center" },
  addressHeaderText: { fontSize: 12, fontFamily: fonts.bold, color: colors.textPrimary },
  addressDivider: { height: 1, backgroundColor: colors.goldMuted, marginBottom: 10 },
  addressName: { fontSize: 14, fontFamily: fonts.bold, color: colors.textPrimary, marginBottom: 3 },
  addressSub: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSecondary, lineHeight: 18 },
});
