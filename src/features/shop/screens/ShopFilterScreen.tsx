import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import type { ShopBrowseStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type Step = "brand" | "category";

const ACCENTS = [
  { bg: "#FFF0F5", border: "#F5C0D0", text: "#B94A72" },
  { bg: "#F0F4FF", border: "#C0CEFD", text: "#3D5FA8" },
  { bg: "#FFF8EC", border: "#F5DCA0", text: "#9A6E1A" },
  { bg: "#F0FBF4", border: "#B7DDC7", text: "#2F7A4F" },
];

function getAccent(index: number) {
  return ACCENTS[index % ACCENTS.length];
}

// ─── Category card (text) ─────────────────────────────────────────────────────

function FilterCard({
  title,
  note,
  bg,
  border,
  textColor,
  accentBarColor,
  onPress,
}: {
  title: string;
  note?: string;
  bg: string;
  border: string;
  textColor: string;
  accentBarColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: bg, borderColor: border }]}
    >
      <View style={[styles.accentBar, { backgroundColor: accentBarColor }]} />
      <View style={styles.copy}>
        <Text numberOfLines={2} style={[styles.cardTitle, { color: textColor }]}>
          {title}
        </Text>
        {note ? <Text style={styles.cardNote}>{note}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={textColor} style={styles.chevron} />
    </Pressable>
  );
}

// ─── Brand image card ─────────────────────────────────────────────────────────

function BrandSlide({
  name,
  imageUrl,
  cardWidth,
  onPress,
}: {
  name: string;
  imageUrl?: string | null;
  cardWidth: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.brandCard, { width: cardWidth }, pressed && { opacity: 0.82 }]}
    >
      {imageUrl ? (
        <CommerceImage style={styles.brandImage} uri={imageUrl} contentFit="cover" />
      ) : (
        <View style={styles.brandImagePlaceholder} />
      )}
      <View style={[styles.brandGradient, { bottom: 50, height: 35, opacity: 0.15 }]} />
      <View style={[styles.brandGradient, { bottom: 20, height: 35, opacity: 0.35 }]} />
      <View style={[styles.brandGradient, { bottom: 0, height: 35, opacity: 0.55 }]} />
      <View style={styles.brandLabel}>
        <Text style={styles.brandName} numberOfLines={1}>{name}</Text>
      </View>
    </Pressable>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_ORDER: Step[] = ["brand", "category"];
const STEP_LABELS: Record<Step, string> = { brand: "แบรนด์", category: "หมวดหมู่" };

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEP_ORDER.indexOf(current);
  return (
    <View style={styles.stepRow}>
      {STEP_ORDER.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const bg = isCurrent ? "#FFFFFF" : isDone ? "rgba(255,255,255,0.2)" : "transparent";
        const border = isCurrent ? "#FFFFFF" : isDone ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)";
        const textColor = isCurrent ? colors.primaryStrong : isDone ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)";
        return (
          <View key={step} style={styles.stepItem}>
            <View style={[styles.stepChip, { backgroundColor: bg, borderColor: border }]}>
              <Text style={[styles.stepLabel, { color: textColor }]}>{STEP_LABELS[step]}</Text>
            </View>
            {i < STEP_ORDER.length - 1 && (
              <MaterialIcons name="chevron-right" size={16} color="rgba(255,255,255,0.35)" />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ShopFilterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopBrowseStackParamList>>();
  const { width } = useWindowDimensions();
  const products = useAppStore((state) => state.products);
  const categories = useAppStore((state) => state.categories);
  const brands = useAppStore((state) => state.brands);

  const [step, setStep] = useState<Step>("brand");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState<string>("");

  const hPad = spacing["2xl"];
  const cardGap = spacing.md;
  const cardWidth = (width - hPad * 2 - cardGap) / 2;

  const availableCategories = useMemo(() => {
    if (!selectedBrandId) return [];
    const catIds = new Set(
      products.filter((p) => p.brandId === selectedBrandId).map((p) => p.categoryId),
    );
    return categories.filter((c) => catIds.has(c.id));
  }, [products, categories, selectedBrandId]);

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

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title={step === "brand" ? "เลือกแบรนด์" : "เลือกหมวดหมู่"}
          subtitle={step === "category" ? selectedBrandName : undefined}
          onBack={step === "category" ? () => setStep("brand") : undefined}
        />
      }
    >
      <StepIndicator current={step} />

      {/* ── Brand step: 2-column image grid ─────────────────────────────── */}
      {step === "brand" && (
        <View style={[styles.brandGrid, { paddingHorizontal: hPad, gap: cardGap }]}>
          {brands.length === 0 && (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing["3xl"] }} />
          )}
          {brands.map((brand) => (
            <BrandSlide
              key={brand.id}
              name={brand.name}
              imageUrl={brand.imageUrl}
              cardWidth={cardWidth}
              onPress={() => selectBrand(brand.id, brand.name)}
            />
          ))}
        </View>
      )}

      {/* ── Category step: text cards ─────────────────────────────────────── */}
      {step === "category" && (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>
          <FilterCard
            title="ทุกหมวดหมู่"
            note={`ดูสินค้าทั้งหมดของ ${selectedBrandName}`}
            bg="rgba(255,255,255,0.12)"
            border="rgba(255,255,255,0.25)"
            textColor="#FFFFFF"
            accentBarColor="rgba(255,255,255,0.25)"
            onPress={() => selectCategory(null)}
          />
          {availableCategories.map((cat, index) => {
            const accent = getAccent(index);
            return (
              <FilterCard
                key={cat.id}
                title={cat.title}
                bg={accent.bg}
                border={accent.border}
                textColor={accent.text}
                accentBarColor={accent.border}
                onPress={() => selectCategory(cat.id)}
              />
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["2xl"],
    marginBottom: spacing.xl,
    gap: 4,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  // Brand slides
  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: spacing["2xl"],
  },
  brandCard: {
    height: 120,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  brandImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  brandImagePlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
  },
  brandGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#000000",
  },
  brandLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.bold,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  // Category list
  list: {
    gap: spacing.md,
    paddingBottom: spacing["2xl"],
  },
  card: {
    minHeight: 68,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  copy: {
    flex: 1,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  cardNote: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  chevron: {
    marginRight: spacing.md,
  },
});
