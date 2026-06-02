/**
 * ShopFilterScreen — v2 Design Proposal
 *
 * การเปลี่ยนแปลงจาก v1:
 * ─────────────────────
 * • ไม่ใช้ AppHeader — minimal page header เหมือนทุกหน้า
 * • Step indicator: active = gold pill, done = semi-transparent, pending = muted
 *
 * Brand step:
 * • Brand row: เพิ่ม gold left accent bar หลังรูป
 * • เพิ่ม brand sub text (collections)
 * • เพิ่ม gold product count pill
 * • Gold circle arrow button แทน plain chevron
 * • Subtle gold border บน card
 *
 * Category step:
 * • เพิ่ม icon wrap circle แต่ละหมวด
 * • Gold accent bar: ทุกหมวด = gold / "ทุกหมวดหมู่" = gold muted
 * • Category subtitle จาก domain data
 * • Gold arrow circle แทน plain chevron
 */

import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator, Pressable, ScrollView,
  StyleSheet, Text, View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { CommerceImage } from "@/components/ui/CommerceImage";
import type { ShopBrowseStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type Step = "brand" | "category";
const STEP_ORDER: Step[] = ["brand", "category"];
const STEP_LABELS: Record<Step, string> = { brand: "แบรนด์", category: "หมวดหมู่" };

// Category icons
const CAT_ICONS: Record<string, string> = {
  "color-bleach": "palette",
  "shampoo-mask": "water-drop",
  "leave-in": "auto-fix-high",
};

export function ShopFilterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopBrowseStackParamList>>();
  const products = useAppStore((state) => state.products);
  const categories = useAppStore((state) => state.categories);
  const brands = useAppStore((state) => state.brands);

  const [step, setStep] = useState<Step>("brand");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState<string>("");

  const availableCategories = useMemo(() => {
    if (!selectedBrandId) return [];
    const catIds = new Set(
      products.filter((p) => p.brandId === selectedBrandId).map((p) => p.categoryId),
    );
    return categories.filter((c) => catIds.has(c.id));
  }, [products, categories, selectedBrandId]);

  function brandProductCount(brandId: string) {
    return products.filter((p) => p.brandId === brandId).length;
  }

  function getBrandSub(brandId: string): string {
    const cols = [...new Set(
      products.filter((p) => p.brandId === brandId && p.collectionName)
        .map((p) => p.collectionName!).slice(0, 3)
    )];
    return cols.join(" · ");
  }

  function selectBrand(id: string, name: string) {
    setSelectedBrandId(id);
    setSelectedBrandName(name);
    setStep("category");
  }

  function selectCategory(id: string | null) {
    navigation.navigate("ProductList", {
      brandId: selectedBrandId ?? undefined,
      categoryId: id ?? undefined,
    });
  }

  const currentIndex = STEP_ORDER.indexOf(step);

  return (
    <Screen contentContainerStyle={styles.content}>

      {/* ✦ Minimal page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>
            {step === "brand" ? "เลือกแบรนด์" : "เลือกหมวดหมู่"}
          </Text>
          {step === "category" && (
            <Text style={styles.pageSubtitle}>{selectedBrandName}</Text>
          )}
        </View>
        {step === "category" && (
          <Pressable onPress={() => setStep("brand")} style={styles.backBtn} hitSlop={10}>
            <MaterialIcons name="arrow-back-ios" size={12} color={colors.goldDeep} />
            <Text style={styles.backText}>ย้อนกลับ</Text>
          </Pressable>
        )}
      </View>

      {/* ✦ Step indicator */}
      <View style={styles.stepRow}>
        {STEP_ORDER.map((s, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <View key={s} style={styles.stepItem}>
              <View style={[
                styles.stepChip,
                isCurrent && styles.stepChipActive,
                isDone && styles.stepChipDone,
                !isCurrent && !isDone && styles.stepChipPending,
              ]}>
                {isDone && (
                  <MaterialIcons name="check" size={10} color="rgba(255,255,255,0.8)" style={{ marginRight: 3 }} />
                )}
                <Text style={[
                  styles.stepLabel,
                  isCurrent && styles.stepLabelActive,
                  isDone && styles.stepLabelDone,
                ]}>
                  {STEP_LABELS[s]}
                </Text>
              </View>
              {i < STEP_ORDER.length - 1 && (
                <MaterialIcons name="chevron-right" size={14} color="rgba(255,255,255,0.3)" />
              )}
            </View>
          );
        })}
      </View>

      {/* ── STEP 1: Brand list ──────────────────────────────── */}
      {step === "brand" && (
        <View style={styles.brandList}>
          {brands.length === 0 && (
            <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
          )}
          {brands.map((brand) => {
            const count = brandProductCount(brand.id);
            const sub = getBrandSub(brand.id);
            return (
              <Pressable
                key={brand.id}
                style={({ pressed }) => [styles.brandRow, pressed && { opacity: 0.86 }]}
                onPress={() => selectBrand(brand.id, brand.name)}
              >
                {/* Brand image */}
                <View style={styles.brandImgWrap}>
                  {brand.imageUrl ? (
                    <CommerceImage style={styles.brandImg} uri={brand.imageUrl} contentFit="cover" />
                  ) : (
                    <View style={styles.brandImgPlaceholder}>
                      <MaterialIcons name="storefront" size={28} color={colors.sage} />
                    </View>
                  )}
                  {/* ✦ Gold right accent */}
                  <View style={styles.brandImgAccent} />
                </View>

                {/* Brand info */}
                <View style={styles.brandBody}>
                  <Text style={styles.brandName}>{brand.name}</Text>
                  {sub ? <Text style={styles.brandSub} numberOfLines={1}>{sub}</Text> : null}
                  {count > 0 && (
                    <View style={styles.countPill}>
                      <Text style={styles.countText}>{count} สินค้า</Text>
                    </View>
                  )}
                </View>

                {/* ✦ Gold circle arrow */}
                <View style={styles.arrowCircle}>
                  <MaterialIcons name="arrow-forward" size={15} color={colors.gold} />
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── STEP 2: Category list ───────────────────────────── */}
      {step === "category" && (
        <ScrollView
          contentContainerStyle={styles.catList}
          showsVerticalScrollIndicator={false}
        >
          {/* ทุกหมวดหมู่ */}
          <CategoryCard
            icon="apps"
            title="ทุกหมวดหมู่"
            note={`ดูสินค้าทั้งหมดของ ${selectedBrandName}`}
            accentVariant="all"
            onPress={() => selectCategory(null)}
          />
          {availableCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              icon={(CAT_ICONS[cat.id] ?? "label") as any}
              title={cat.title}
              note={cat.subtitle}
              accentVariant="jade"
              onPress={() => selectCategory(cat.id)}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

// ✦ Category card component
function CategoryCard({
  icon, title, note, accentVariant, onPress,
}: {
  icon: string; title: string; note?: string;
  accentVariant: "all" | "jade";
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.catCard, pressed && { opacity: 0.88 }]}
      onPress={onPress}
    >
      {/* Accent bar */}
      <View style={[
        styles.catAccentBar,
        accentVariant === "jade" && styles.catAccentBarJade,
      ]} />

      {/* Icon */}
      <View style={[
        styles.catIconWrap,
        accentVariant === "jade" && styles.catIconWrapJade,
      ]}>
        <MaterialIcons
          name={icon as any}
          size={19}
          color={accentVariant === "jade" ? colors.primary : colors.goldDeep}
        />
      </View>

      {/* Text */}
      <View style={styles.catBody}>
        <Text style={styles.catTitle}>{title}</Text>
        {note ? <Text style={styles.catNote} numberOfLines={1}>{note}</Text> : null}
      </View>

      {/* Arrow */}
      <View style={styles.arrowCircle}>
        <MaterialIcons name="arrow-forward" size={15} color={colors.gold} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing["3xl"], backgroundColor: colors.background },

  // Page header
  pageHeader: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8,
  },
  pageTitle: { color: "#fff", fontSize: 24, fontFamily: fonts.extraBold },
  pageSubtitle: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: fonts.medium, marginTop: 2 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingTop: 6 },
  backText: { color: colors.goldDeep, fontSize: 12, fontFamily: fonts.semiBold },

  // Step indicator
  stepRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 18, gap: 6 },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepChip: { flexDirection: "row", alignItems: "center", borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  stepChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepChipDone: { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.3)" },
  stepChipPending: { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.15)" },
  stepLabel: { fontSize: 11, fontFamily: fonts.semiBold, color: "rgba(255,255,255,0.35)" },
  stepLabelActive: { color: colors.goldDark, fontFamily: fonts.bold },
  stepLabelDone: { color: "rgba(255,255,255,0.75)" },

  // Brand list
  brandList: { paddingHorizontal: 16, gap: 10 },
  brandRow: {
    height: 86, borderRadius: 18, overflow: "hidden",
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: colors.goldMuted,
    shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  brandImgWrap: { width: 100, height: 86, position: "relative", flexShrink: 0 },
  brandImg: { width: 100, height: 86 },
  brandImgPlaceholder: { width: 100, height: 86, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  brandImgAccent: { position: "absolute", right: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.gold },
  brandBody: { flex: 1, paddingHorizontal: 14, gap: 3 },
  brandName: { fontSize: 16, fontFamily: fonts.bold, color: "#1a1a1a" },
  brandSub: { fontSize: 9, fontFamily: fonts.medium, color: colors.textMuted },
  countPill: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center",
    backgroundColor: colors.goldSoft, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  countText: { color: colors.goldDeep, fontSize: 9, fontFamily: fonts.bold },
  arrowCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.goldSoft,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.3)",
    alignItems: "center", justifyContent: "center",
    marginRight: 12, flexShrink: 0,
  },

  // Category list
  catList: { paddingHorizontal: 16, gap: 10, paddingBottom: spacing["2xl"] },
  catCard: {
    minHeight: 72, borderRadius: 18, overflow: "hidden",
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: colors.goldMuted,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  catAccentBar: { width: 4, alignSelf: "stretch", backgroundColor: colors.gold },
  catAccentBarJade: { backgroundColor: colors.primary },
  catIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.goldSoft,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.25)",
    alignItems: "center", justifyContent: "center",
    marginHorizontal: 12, flexShrink: 0,
  },
  catIconWrapJade: { backgroundColor: "rgba(47,122,79,0.08)", borderColor: "rgba(47,122,79,0.2)" },
  catBody: { flex: 1, paddingVertical: 14 },
  catTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#1a1a1a" },
  catNote: { fontSize: 10, fontFamily: fonts.medium, color: colors.textMuted, marginTop: 2 },
});
