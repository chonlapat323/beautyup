import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";
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
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>สูตรพิเศษ</Text>
        <Text style={styles.sectionSub}>คลิกเพื่อดูสินค้าในสูตร</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {bundles.map((bundle) => (
          <Pressable
            key={bundle.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("ProductList", {
                bundleId: bundle.id,
                bundleName: bundle.name,
              })
            }
          >
            <CommerceImage style={styles.cardImage} uri={bundle.imageUrl} />
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={2}>{bundle.name}</Text>
              <Text style={styles.cardMeta}>{bundle.items.length} รายการ</Text>
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
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSub: {
    color: "rgba(255,255,255,0.7)",
    ...typography.caption,
    marginTop: 2,
  },
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    width: 160,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  cardImage: {
    width: 160,
    height: 120,
    backgroundColor: colors.surfaceMuted,
  },
  cardBody: {
    padding: spacing.md,
    gap: 2,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    minHeight: 36,
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
