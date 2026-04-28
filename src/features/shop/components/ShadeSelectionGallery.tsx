import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { colors, fonts, radius, spacing } from "@/theme";
import type { Shade } from "@/types/domain";

type ShadeGroup = {
  groupName: string;
  items: Shade[];
};

type ShadeSelectionGalleryProps = {
  groups: ShadeGroup[];
  activeGroup: string;
  onSelectGroup: (groupName: string) => void;
  onSelectShade: (shade: Shade) => void;
};

export function ShadeSelectionGallery({
  groups,
  activeGroup,
  onSelectGroup,
  onSelectShade,
}: ShadeSelectionGalleryProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 360 ? 20 : 24;
  const columnGap = 14;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - columnGap) / 2);

  const activeGroupData = groups.find((group) => group.groupName === activeGroup);
  const shades = activeGroupData?.items ?? [];

  return (
    <>
      <View style={styles.groupTabsWrap}>
        <ScrollView
          contentContainerStyle={[
            styles.groupRow,
            { paddingHorizontal: horizontalPadding },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {groups.map((group) => {
            const isActive = group.groupName === activeGroup;

            return (
              <Pressable
                key={group.groupName}
                onPress={() => onSelectGroup(group.groupName)}
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

      <View style={[styles.familyCard, { marginHorizontal: horizontalPadding }]}>
        <View style={styles.familyTopRow}>
          <View style={styles.familyCopy}>
            <Text style={styles.familyEyebrow}>กลุ่มเฉด</Text>
            <Text style={styles.familyTitle}>{activeGroup}</Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{shades.length} เฉด</Text>
          </View>
        </View>

        <Text style={styles.familyHint}>แตะเฉดที่ต้องการเพื่อดูสินค้าที่เกี่ยวข้องทันที</Text>
      </View>

      <View style={[styles.grid, { paddingHorizontal: horizontalPadding }]}>
        {shades.map((shade) => (
          <Pressable
            key={shade.id}
            onPress={() => onSelectShade(shade)}
            style={[styles.card, { width: cardWidth }]}
          >
            <View style={styles.visualFrame}>
              <View style={styles.visualGlowTop} />
              <View style={styles.visualGlowBottom} />

              <View style={styles.visualBadge}>
                <Text style={styles.visualBadgeText}>{shade.groupName}</Text>
              </View>

              <CommerceImage resizeMode="cover" style={styles.image} uri={shade.imageUrl} />
            </View>

            <View style={styles.cardBody}>
              <Text numberOfLines={2} style={styles.name}>
                {shade.name}
              </Text>
              <Text numberOfLines={2} style={styles.hint}>
                แตะเพื่อดูสินค้าที่ตรงกับเฉดนี้
              </Text>

              <View style={styles.actionRow}>
                <Text style={styles.actionText}>ดูสินค้า</Text>
                <MaterialIcons color={colors.primaryDark} name="chevron-right" size={18} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  groupTabsWrap: {
    marginBottom: spacing.lg,
  },
  groupRow: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  groupChip: {
    minHeight: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#D5E4D9",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  groupChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    shadowColor: "#163423",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  groupChipText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
    color: "#2B4737",
  },
  groupChipTextActive: {
    color: "#FFFFFF",
  },
  familyCard: {
    borderRadius: radius.lg,
    backgroundColor: "#F6FBF7",
    borderWidth: 1,
    borderColor: "#DFECE2",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  familyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  familyCopy: {
    gap: 4,
    flex: 1,
  },
  familyEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fonts.bold,
    letterSpacing: 1.2,
    color: "#6E8A77",
    textTransform: "uppercase",
  },
  familyTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fonts.extraBold,
    color: "#183223",
  },
  countBadge: {
    borderRadius: radius.pill,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E7DB",
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  countBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.bold,
    color: colors.primaryDark,
  },
  familyHint: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: "#5C7767",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4EEE7",
    overflow: "hidden",
    shadowColor: "#183322",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  visualFrame: {
    height: 210,
    backgroundColor: "#F9FCFA",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5F0",
  },
  visualGlowTop: {
    position: "absolute",
    top: -14,
    right: -20,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(213, 235, 219, 0.85)",
  },
  visualGlowBottom: {
    position: "absolute",
    bottom: -24,
    left: -10,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(233, 245, 236, 0.95)",
  },
  visualBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#DCE9DF",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  visualBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fonts.bold,
    color: colors.primaryDark,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cardBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: "#182E22",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: "#6B7F73",
    minHeight: 36,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.pill,
    backgroundColor: "#EEF7F0",
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  actionText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.bold,
    color: colors.primaryDark,
  },
});
