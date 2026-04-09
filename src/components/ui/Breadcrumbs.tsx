import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

type BreadcrumbsProps = {
  items: Array<{
    label: string;
    onPress?: () => void;
  }>;
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={`${item.label}-${index}`} style={styles.segment}>
          {index > 0 ? <Text style={styles.separator}>/</Text> : null}
          {item.onPress && index !== items.length - 1 ? (
            <Pressable onPress={item.onPress}>
              <Text numberOfLines={1} style={styles.link}>
                {item.label}
              </Text>
            </Pressable>
          ) : (
            <Text numberOfLines={1} style={[styles.label, index === items.length - 1 && styles.current]}>
              {item.label}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing["2xl"],
    marginTop: -spacing.sm,
    marginBottom: spacing.xl,
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  separator: {
    color: colors.textMuted,
    ...typography.caption,
  },
  label: {
    color: colors.textMuted,
    ...typography.caption,
  },
  link: {
    color: colors.primaryStrong,
    ...typography.caption,
  },
  current: {
    color: colors.primaryStrong,
  },
});
