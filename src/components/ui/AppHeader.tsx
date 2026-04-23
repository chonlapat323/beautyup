import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { BrandLockup } from "@/components/ui/BrandLockup";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing, typography } from "@/theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const member = useAppStore((state) => state.member);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <BrandLockup compact />
        {member && (
          <View style={styles.pointsPill}>
            <MaterialIcons name="auto-awesome" size={12} color="#fff" />
            <Text style={styles.pointsText}>
              {member.pointBalance.toLocaleString()} แต้ม
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  pointsText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    ...typography.headline,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    ...typography.body,
  },
});
