import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { categories, shadeGroups, shades } from "@/mock/catalog";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function ShadeSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ShadeSelection">>();
  const selectedShadeId = useAppStore((state) => state.selectedShadeId);
  const setSelectedShade = useAppStore((state) => state.setSelectedShade);
  const category = categories.find((item) => item.id === route.params.categoryId);
  const initialFamily = selectedShadeId?.split("-").slice(1).join("-");
  const initialGroup =
    shadeGroups.find((group) => initialFamily && group.family === initialFamily)?.id ??
    shadeGroups[0].id;
  const [activeGroupId, setActiveGroupId] = useState<string>(initialGroup);
  const activeGroup = shadeGroups.find((group) => group.id === activeGroupId) ?? shadeGroups[0];
  const filteredShades = useMemo(
    () => shades.filter((shade) => shade.id.split("-").slice(1).join("-") === activeGroup.family),
    [activeGroup],
  );

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader
        title="Choose your shade"
        subtitle="Basic Tone only. Select a Milbon family, then choose the exact shade."
      />
      <Breadcrumbs
        items={[
          { label: "Home", onPress: () => navigation.navigate("Home") },
          { label: "Categories", onPress: () => navigation.navigate("Categories") },
          { label: category?.title ?? "Color & Bleach" },
          { label: "Shade Selection" },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.groupRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {shadeGroups.map((group) => {
          const active = group.id === activeGroupId;

          return (
            <Pressable
              key={group.id}
              onPress={() => setActiveGroupId(group.id)}
              style={[styles.groupChip, active && styles.groupChipActive]}
            >
              <Text style={[styles.groupChipText, active && styles.groupChipTextActive]}>
                {group.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.familyHeader}>
        <Text style={styles.familyTitle}>{activeGroup.title}</Text>
        <Text style={styles.familyCaption}>Milbon Basic Tone family</Text>
      </View>

      <View style={styles.grid}>
        {filteredShades.map((shade) => {
          const selected = selectedShadeId === shade.id;

          return (
            <Pressable
              key={shade.id}
              onPress={() => {
                setSelectedShade(shade.id);
                navigation.navigate("ProductList", {
                  categoryId: route.params.categoryId,
                  shadeId: shade.id,
                });
              }}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <View style={styles.imageShell}>
                <CommerceImage style={styles.imageWrap} uri={shade.imageUrl} />
                {selected ? (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>Selected</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.footer}>
                <View style={[styles.swatch, { backgroundColor: shade.swatch }]} />
                <View style={styles.copy}>
                  <Text style={styles.name}>{shade.name}</Text>
                  <Text style={styles.tone}>{shade.tone}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
  },
  groupRow: {
    gap: spacing.md,
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.xl,
  },
  groupChip: {
    minWidth: 70,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  groupChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  groupChipText: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  groupChipTextActive: {
    color: colors.primaryStrong,
  },
  familyHeader: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  familyTitle: {
    color: colors.textPrimary,
    ...typography.title,
  },
  familyCaption: {
    color: colors.primaryStrong,
    ...typography.caption,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing["2xl"],
  },
  card: {
    width: "47%",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    shadowColor: "#8A6870",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  imageWrap: {
    height: 178,
    backgroundColor: colors.surfaceMuted,
  },
  imageShell: {
    position: "relative",
  },
  selectedBadge: {
    position: "absolute",
    marginTop: spacing.md,
    marginRight: spacing.md,
    top: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  selectedBadgeText: {
    color: colors.primaryStrong,
    ...typography.caption,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    ...typography.title,
  },
  tone: {
    color: colors.textSecondary,
    ...typography.caption,
  },
});
