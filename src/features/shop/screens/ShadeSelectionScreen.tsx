import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { ShadeArtwork } from "@/components/ui/BeautyVisuals";
import { shades } from "@/mock/catalog";
import { useAppStore } from "@/store/useAppStore";
import type { ShopStackParamList } from "@/navigation/types";
import { colors, radius, spacing, typography } from "@/theme";

export function ShadeSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const route = useRoute<RouteProp<ShopStackParamList, "ShadeSelection">>();
  const selectedShadeId = useAppStore((state) => state.selectedShadeId);
  const setSelectedShade = useAppStore((state) => state.setSelectedShade);

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader
        title="Choose your shade"
        subtitle="Color browsing starts with the tone you want to achieve."
      />

      <View style={styles.grid}>
        {shades.map((shade) => {
          const selected = selectedShadeId === shade.id;

          return (
            <Pressable
              key={shade.id}
              onPress={() => setSelectedShade(shade.id)}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <ShadeArtwork shade={shade} style={styles.imageWrap}>
                {selected ? (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>Selected</Text>
                  </View>
                ) : null}
              </ShadeArtwork>
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

      <Pressable
        disabled={!selectedShadeId}
        onPress={() =>
          navigation.navigate("ProductList", {
            categoryId: route.params.categoryId,
            shadeId: selectedShadeId,
          })
        }
        style={[styles.button, !selectedShadeId && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing["3xl"],
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
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  selectedBadge: {
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
  button: {
    marginTop: spacing["3xl"],
    marginHorizontal: spacing["2xl"],
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.title,
  },
});
