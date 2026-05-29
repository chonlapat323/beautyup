import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import type { ShopBrowseStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

type Step = "brand" | "category" | "collection";

const ACCENTS = [
  { bg: "#FFF0F5", border: "#F5C0D0", text: "#B94A72" },
  { bg: "#F0F4FF", border: "#C0CEFD", text: "#3D5FA8" },
  { bg: "#FFF8EC", border: "#F5DCA0", text: "#9A6E1A" },
  { bg: "#F0FBF4", border: "#B7DDC7", text: "#2F7A4F" },
];

function getAccent(index: number) {
  return ACCENTS[index % ACCENTS.length];
}

// ─── Reusable card ───────────────────────────────────────────────────────────

type CardProps = {
  title: string;
  note?: string;
  bg: string;
  border: string;
  textColor: string;
  accentBarColor: string;
  onPress: () => void;
};

function FilterCard({ title, note, bg, border, textColor, accentBarColor, onPress }: CardProps) {
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
        {note ? (
          <Text style={[styles.cardNote, { color: textColor }]}>{note}</Text>
        ) : null}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={textColor}
        style={styles.chevron}
      />
    </Pressable>
  );
}

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEP_ORDER: Step[] = ["brand", "category", "collection"];
const STEP_LABELS: Record<Step, string> = {
  brand: "แบรนด์",
  category: "หมวดหมู่",
  collection: "คอลเลกชัน",
};

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEP_ORDER.indexOf(current);

  return (
    <View style={styles.stepRow}>
      {STEP_ORDER.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;

        let bg: string;
        let border: string;
        let textColor: string;

        if (isCurrent) {
          bg = "#FFFFFF";
          border = "#FFFFFF";
          textColor = colors.primaryStrong;
        } else if (isDone) {
          bg = "rgba(255,255,255,0.2)";
          border = "rgba(255,255,255,0.4)";
          textColor = "rgba(255,255,255,0.85)";
        } else {
          bg = "transparent";
          border = "rgba(255,255,255,0.2)";
          textColor = "rgba(255,255,255,0.4)";
        }

        return (
          <View key={step} style={styles.stepItem}>
            <View style={[styles.stepChip, { backgroundColor: bg, borderColor: border }]}>
              <Text style={[styles.stepLabel, { color: textColor }]}>
                {STEP_LABELS[step]}
              </Text>
            </View>
            {i < STEP_ORDER.length - 1 ? (
              <MaterialIcons
                name="chevron-right"
                size={16}
                color="rgba(255,255,255,0.35)"
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function ShopFilterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShopBrowseStackParamList>>();

  const products = useAppStore((state) => state.products);
  const categories = useAppStore((state) => state.categories);
  const collections = useAppStore((state) => state.collections);

  const [step, setStep] = useState<Step>("brand");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");

  // ── Derived data ──────────────────────────────────────────────────────────

  const brands = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) {
      if (p.brandId && p.brandName && !seen.has(p.brandId)) {
        seen.set(p.brandId, p.brandName);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const availableCategories = useMemo(() => {
    if (!selectedBrandId) return [];
    const catIds = new Set(
      products.filter((p) => p.brandId === selectedBrandId).map((p) => p.categoryId)
    );
    return categories.filter((c) => catIds.has(c.id));
  }, [products, categories, selectedBrandId]);

  const availableCollections = useMemo(() => {
    if (!selectedBrandId) return [];
    const matching = products.filter(
      (p) =>
        p.brandId === selectedBrandId &&
        (selectedCategoryId == null || p.categoryId === selectedCategoryId) &&
        p.collectionId != null
    );
    const seen = new Map<string, string>();
    for (const p of matching) {
      if (p.collectionId && !seen.has(p.collectionId)) {
        seen.set(p.collectionId, p.collectionName ?? p.collectionId);
      }
    }
    // Keep only collections that exist in the store
    const storeColIds = new Set(collections.map((c) => c.id));
    return Array.from(seen.entries())
      .filter(([id]) => storeColIds.has(id))
      .map(([id, name]) => ({ id, name }));
  }, [products, collections, selectedBrandId, selectedCategoryId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleBack() {
    if (step === "category") setStep("brand");
    else if (step === "collection") setStep("category");
  }

  function selectBrand(id: string, name: string) {
    setSelectedBrandId(id);
    setSelectedBrandName(name);
    setSelectedCategoryId(null);
    setSelectedCategoryName("");
    setStep("category");
  }

  function selectCategory(id: string | null, name: string) {
    setSelectedCategoryId(id);
    setSelectedCategoryName(name);
    setStep("collection");
  }

  function selectCollection(id: string | null) {
    navigation.navigate("ProductList", {
      brandId: selectedBrandId ?? undefined,
      categoryId: selectedCategoryId ?? undefined,
      collectionId: id ?? undefined,
    });
  }

  // ── Header title / subtitle ───────────────────────────────────────────────

  const headerTitle =
    step === "brand"
      ? "เลือกแบรนด์"
      : step === "category"
      ? "เลือกหมวดหมู่"
      : "เลือกคอลเลกชัน";

  const headerSubtitle =
    step === "brand"
      ? ""
      : step === "category"
      ? selectedBrandName
      : `${selectedBrandName} · ${selectedCategoryName || "ทุกหมวดหมู่"}`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title={headerTitle}
          subtitle={headerSubtitle || undefined}
          onBack={step !== "brand" ? handleBack : undefined}
        />
      }
    >
      <StepIndicator current={step} />

      {step === "brand" && (
        <>
          {brands.length === 0 ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: spacing["3xl"] }}
            />
          ) : null}
          <View style={styles.list}>
            {brands.map((brand, index) => {
              const accent = getAccent(index);
              return (
                <FilterCard
                  key={brand.id}
                  title={brand.name}
                  bg={accent.bg}
                  border={accent.border}
                  textColor={accent.text}
                  accentBarColor={accent.border}
                  onPress={() => selectBrand(brand.id, brand.name)}
                />
              );
            })}
          </View>
        </>
      )}

      {step === "category" && (
        <View style={styles.list}>
          <FilterCard
            title="ทุกหมวดหมู่"
            bg="rgba(255,255,255,0.12)"
            border="rgba(255,255,255,0.25)"
            textColor="#FFFFFF"
            accentBarColor="rgba(255,255,255,0.25)"
            onPress={() => selectCategory(null, "")}
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
                onPress={() => selectCategory(cat.id, cat.title)}
              />
            );
          })}
        </View>
      )}

      {step === "collection" && (
        <View style={styles.list}>
          <FilterCard
            title="ทุกคอลเลกชัน"
            bg="rgba(255,255,255,0.12)"
            border="rgba(255,255,255,0.25)"
            textColor="#FFFFFF"
            accentBarColor="rgba(255,255,255,0.25)"
            onPress={() => selectCollection(null)}
          />
          {availableCollections.map((col, index) => {
            const accent = getAccent(index);
            return (
              <FilterCard
                key={col.id}
                title={col.name}
                bg={accent.bg}
                border={accent.border}
                textColor={accent.text}
                accentBarColor={accent.border}
                onPress={() => selectCollection(col.id)}
              />
            );
          })}
        </View>
      )}
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  // Step indicator
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
  // Card list
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing["2xl"],
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
