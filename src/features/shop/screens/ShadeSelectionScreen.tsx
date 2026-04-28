import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToCategories, navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { fetchShades } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";
import type { Shade } from "@/types/domain";

export function ShadeSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ShadeSelection">>();
  const categories = useAppStore((state) => state.categories);
  const selectedShadeId = useAppStore((state) => state.selectedShadeId);
  const setSelectedShade = useAppStore((state) => state.setSelectedShade);

  const [shades, setShades] = useState<Shade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeGroup, setActiveGroup] = useState("");

  const category = categories.find((entry) => entry.id === route.params.categoryId);

  useEffect(() => {
    setIsLoading(true);
    setError(false);

    fetchShades(route.params.categoryId)
      .then(setShades)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [route.params.categoryId]);

  const groups = useMemo(() => {
    const shadeMap = new Map<string, Shade[]>();

    for (const shade of shades) {
      const key = shade.groupName;
      if (!shadeMap.has(key)) shadeMap.set(key, []);
      shadeMap.get(key)!.push(shade);
    }

    return Array.from(shadeMap.entries()).map(([groupName, items]) => ({
      groupName,
      items,
    }));
  }, [shades]);

  useEffect(() => {
    if (groups.length > 0 && !activeGroup) {
      setActiveGroup(groups[0].groupName);
    }
  }, [activeGroup, groups]);

  const filteredShades = useMemo(
    () => groups.find((group) => group.groupName === activeGroup)?.items ?? [],
    [activeGroup, groups],
  );

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="เลือกเฉดสี"
          subtitle={category?.title ?? "Color & Bleach"}
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "หมวดหมู่สินค้า", onPress: () => navigateToCategories(navigation) },
            { label: "เลือกเฉดสี" },
          ]}
        />
      }
    >
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.muted}>ไม่สามารถโหลดเฉดสีได้</Text>
        </View>
      ) : shades.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>ยังไม่มีเฉดสีในหมวดหมู่นี้</Text>
        </View>
      ) : (
        <>
          <View style={styles.groupTabsWrap}>
            <ScrollView
              contentContainerStyle={styles.groupRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {groups.map((group) => {
                const isActive = group.groupName === activeGroup;

                return (
                  <Pressable
                    key={group.groupName}
                    onPress={() => setActiveGroup(group.groupName)}
                    style={[styles.groupChip, isActive && styles.groupChipActive]}
                  >
                    <Text style={[styles.groupChipText, isActive && styles.groupChipTextActive]}>
                      {group.groupName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.familyHeader}>
            <Text style={styles.familyTitle}>{activeGroup}</Text>
            <Text style={styles.familyCaption}>{filteredShades.length} เฉดสี</Text>
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
                      shadeName: shade.name,
                    });
                  }}
                  style={[styles.card, selected && styles.cardSelected]}
                >
                  <View style={styles.imageShell}>
                    <CommerceImage style={styles.imageWrap} uri={shade.imageUrl} />
                    {selected ? (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>เลือกแล้ว</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.footer}>
                    <View style={styles.copy}>
                      <Text style={styles.name}>{shade.name}</Text>
                      <Text style={styles.tone}>{shade.groupName}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  loader: {
    marginTop: spacing["3xl"],
  },
  center: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
  },
  groupTabsWrap: {
    height: 44,
    marginBottom: spacing.lg,
  },
  groupRow: {
    gap: spacing.md,
    paddingHorizontal: spacing["2xl"],
  },
  groupChip: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
    top: 0,
    right: 0,
    marginTop: spacing.md,
    marginRight: spacing.md,
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
