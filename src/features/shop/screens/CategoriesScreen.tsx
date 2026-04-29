import { MaterialIcons } from "@expo/vector-icons";
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
import { colors, fonts, radius, spacing, typography } from "@/theme";
import type { Category } from "@/types/domain";

const ACCENTS = [
  { bg: "#FFF0F5", border: "#F5C0D0", text: "#B94A72" },
  { bg: "#F0F4FF", border: "#C0CEFD", text: "#3D5FA8" },
  { bg: "#FFF8EC", border: "#F5DCA0", text: "#9A6E1A" },
  { bg: "#F0FBF4", border: "#B7DDC7", text: "#2F7A4F" },
];

function getAccent(index: number) {
  return ACCENTS[index % ACCENTS.length];
}

export function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const categories = useAppStore((state) => state.categories);
  const isLoading = useAppStore((state) => state.isLoadingCatalog);

  function handlePress(category: Category) {
    if (category.requiresShadeSelection) {
      navigation.navigate("ShadeSelection", { categoryId: category.id });
    } else {
      navigation.navigate("ProductList", { categoryId: category.id });
    }
  }

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
        {categories.map((category, index) => {
          const accent = getAccent(index);
          return (
            <Pressable
              key={category.id}
              onPress={() => handlePress(category)}
              style={[styles.card, { borderColor: accent.border, backgroundColor: accent.bg }]}
            >
              <View style={[styles.accentBar, { backgroundColor: accent.border }]} />

              <View style={styles.copy}>
                <Text style={[styles.title, { color: accent.text }]}>{category.title}</Text>

                {category.requiresShadeSelection ? (
                  <View style={styles.shadeCue}>
                    <MaterialIcons name="palette" size={12} color={accent.text} />
                    <Text style={[styles.shadeCueText, { color: accent.text }]}>เลือกเฉดสีก่อนช้อป</Text>
                  </View>
                ) : (
                  <Text style={[styles.subtitle, { color: accent.text }]}>พร้อมช้อปได้ทันที</Text>
                )}
              </View>

              <View style={styles.previewWrapper}>
                <CommerceImage style={styles.preview} uri={category.imageUrl} />
              </View>

              <View style={[styles.arrowWrap, { backgroundColor: accent.border }]}>
                <MaterialIcons name="chevron-right" size={20} color={accent.text} />
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
    minHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  accentBar: {
    width: 4,
  },
  copy: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.medium,
    opacity: 0.8,
  },
  shadeCue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shadeCueText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  previewWrapper: {
    width: 120,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  preview: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  arrowWrap: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
