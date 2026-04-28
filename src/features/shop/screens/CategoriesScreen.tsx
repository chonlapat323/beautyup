import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { CategoriesListSkeleton } from "@/components/ui/Skeleton";
import { navigateToHome } from "@/navigation/helpers";
import type { ShopStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

export function CategoriesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const categories = useAppStore((state) => state.categories);
  const isLoading = useAppStore((state) => state.isLoadingCatalog);

  return (
    <Screen
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title="หมวดหมู่สินค้า"
          breadcrumbs={[
            { label: "หน้าแรก", onPress: () => navigateToHome(navigation) },
            { label: "หมวดหมู่สินค้า" },
          ]}
        />
      }
    >
      {isLoading ? (
        <CategoriesListSkeleton />
      ) : categories.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>ยังไม่พบหมวดหมู่สินค้า</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() =>
              category.requiresShadeSelection
                ? navigation.navigate("ShadeSelection", {
                    categoryId: category.id,
                  })
                : navigation.navigate("ProductList", {
                    categoryId: category.id,
                  })
            }
            style={styles.card}
          >
            <View style={styles.copy}>
              <Text style={styles.title}>{category.title}</Text>
              <Text style={styles.subtitle}>
                {category.requiresShadeSelection
                  ? "เลือกเฉดสีก่อนช้อป"
                  : "พร้อมช้อปได้ทันที"}
              </Text>
            </View>

            <View style={styles.previewWrapper}>
              <CommerceImage style={styles.preview} uri={category.imageUrl} />
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  center: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing["3xl"],
  },
  muted: {
    color: colors.textMuted,
    ...typography.body,
  },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing["2xl"],
  },
  card: {
    minHeight: 126,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "stretch",
    paddingLeft: spacing.xl,
    shadowColor: "#8A6870",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  copy: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "500",
  },
  subtitle: {
    color: colors.primary,
    ...typography.caption,
  },
  previewWrapper: {
    width: 132,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  preview: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceMuted,
  },
});
