import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, fonts, radius, spacing } from "@/theme";
import type { Bundle } from "@/types/domain";

type Props = {
  bundles: Bundle[];
  horizontalPadding: number;
};

export function HomeBundleSection({ bundles, horizontalPadding }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();

  if (bundles.length === 0) return null;

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>สูตรพิเศษ</Text>
        <Text style={styles.sectionSub}>คลิกเพื่อดูสินค้าในสูตร</Text>
      </View>

      {/* Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {bundles.map((bundle) => (
          <Pressable
            key={bundle.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
            onPress={() =>
              navigation.navigate("ProductList", {
                bundleId: bundle.id,
                bundleName: bundle.name,
              })
            }
          >
            {/* Image area */}
            <View style={styles.imageArea}>
              {bundle.imageUrl ? (
                <CommerceImage style={styles.image} uri={bundle.imageUrl} contentFit="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons name="local-drink" size={40} color="#C4CEC8" />
                </View>
              )}
              {/* Item count badge */}
              <View style={styles.badge}>
                <MaterialIcons name="auto-awesome" size={11} color={colors.goldDark} />
                <Text style={styles.badgeText}>{bundle.items.length} รายการ</Text>
              </View>
            </View>

            {/* Card body */}
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={2}>{bundle.name}</Text>
              {bundle.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{bundle.description}</Text>
              ) : null}
              <View style={styles.cta}>
                <Text style={styles.ctaText}>ดูสินค้า</Text>
                <MaterialIcons name="chevron-right" size={14} color={colors.primary} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing["2xl"],
  },
  header: {
    marginBottom: spacing.md,
    gap: 2,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  sectionSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    width: 160,
    borderRadius: radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDE9",
    overflow: "hidden",
    shadowColor: "#214530",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageArea: {
    height: 130,
    backgroundColor: "#F0F0F0",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.goldDark,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardName: {
    color: "#1A3A2A",
    fontSize: 15,
    fontFamily: fonts.bold,
    lineHeight: 20,
  },
  cardDesc: {
    color: "#6B8474",
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 16,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  ctaText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
});
