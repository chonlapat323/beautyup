import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { colors, fonts } from "@/theme";
import type { Category } from "@/types/domain";

const centerLeafIcon = require("../../../logo/icon.png") as ReturnType<typeof require>;

type HomeCategoriesSectionProps = {
  categories: Category[];
  horizontalPadding: number;
  onSelectCategory: (categoryId: string, requiresShadeSelection: boolean) => void;
  onViewAll: () => void;
};

export function HomeCategoriesSection({
  categories,
  horizontalPadding,
  onSelectCategory,
  onViewAll,
}: HomeCategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <View style={[styles.shell, { marginHorizontal: horizontalPadding }]}>
      <View style={styles.section}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Categories</Text>
          </View>

          <Pressable hitSlop={8} onPress={onViewAll} style={styles.viewAllLink}>
            <Text style={styles.viewAllText}>View all</Text>
            <MaterialIcons color={colors.primaryDark} name="chevron-right" size={16} />
          </Pressable>
        </View>

        <View style={styles.row}>
          {categories.slice(0, 3).map((category) => (
            <Pressable
              key={category.id}
              onPress={() => onSelectCategory(category.id, category.requiresShadeSelection)}
              style={styles.card}
            >
              <View style={styles.visual}>
                <View style={styles.iconWrap}>
                  <CommerceImage resizeMode="cover" style={styles.icon} uri={category.imageUrl} />
                </View>
              </View>

              <Text numberOfLines={2} style={styles.label}>
                {category.title}
              </Text>
              <Pressable
                onPress={() => onSelectCategory(category.id, category.requiresShadeSelection)}
                style={styles.shopButton}
              >
                <Text style={styles.shopButtonText}>Shop</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
      </View>

      <View pointerEvents="none" style={styles.bottomNotchWrap}>
        <View style={styles.bottomBridge} />
        <View style={styles.bottomNotch}>
          <View style={styles.bottomBadge}>
            <Image resizeMode="contain" source={centerLeafIcon} style={styles.bottomBadgeIcon} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    marginBottom: 42,
  },
  section: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#8EB397",
    paddingTop: 16,
    paddingBottom: 34,
    paddingHorizontal: 16,
    shadowColor: "#214530",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  glowTop: {
    position: "absolute",
    top: -20,
    right: -8,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(209, 231, 215, 0.65)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -34,
    left: -24,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(220, 238, 225, 0.75)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fonts.extraBold,
    color: "#173022",
  },
  viewAllLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontFamily: fonts.semiBold,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    paddingBottom: 8,
  },
  card: {
    flex: 1,
    alignItems: "center",
    gap: 12,
  },
  visual: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#F8FCF9",
    borderWidth: 1,
    borderColor: "#DCE9DF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBE9DF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    color: "#203628",
    fontFamily: fonts.semiBold,
    minHeight: 36,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  shopButton: {
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 56,
    alignItems: "center",
  },
  shopButtonText: {
    fontSize: 11,
    lineHeight: 14,
    color: "#FFFFFF",
    fontFamily: fonts.bold,
  },
  bottomNotchWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -28,
    alignItems: "center",
    zIndex: 5,
  },
  bottomBridge: {
    position: "absolute",
    top: 0,
    width: 74,
    height: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  bottomNotch: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#8EB397",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#214530",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  bottomBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBadgeIcon: {
    width: 28,
    height: 28,
  },
});
