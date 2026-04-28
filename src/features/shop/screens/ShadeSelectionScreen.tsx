import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { navigateToCategories, navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { fetchShades } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, spacing } from "@/theme";
import type { Shade } from "@/types/domain";

import { ShadeSelectionGallery } from "../components/ShadeSelectionGallery";

export function ShadeSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ShadeSelection">>();
  const categories = useAppStore((state) => state.categories);
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
    if (groups.length === 0) return;

    const hasActiveGroup = groups.some((group) => group.groupName === activeGroup);
    if (!hasActiveGroup) {
      setActiveGroup(groups[0].groupName);
    }
  }, [activeGroup, groups]);

  function handleSelectShade(shade: Shade) {
    setSelectedShade(shade.id);
    navigation.navigate("ProductList", {
      categoryId: route.params.categoryId,
      shadeId: shade.id,
      shadeName: shade.name,
    });
  }

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
        <ShadeSelectionGallery
          activeGroup={activeGroup}
          groups={groups}
          onSelectGroup={setActiveGroup}
          onSelectShade={handleSelectShade}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  loader: {
    marginTop: spacing["3xl"],
  },
  center: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
    paddingHorizontal: spacing["2xl"],
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
