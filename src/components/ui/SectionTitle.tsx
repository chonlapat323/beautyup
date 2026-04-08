import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

type SectionTitleProps = {
  title: string;
  actionLabel?: string;
};

export function SectionTitle({ title, actionLabel }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing["2xl"],
  },
  title: {
    color: colors.textPrimary,
    ...typography.title,
  },
  action: {
    color: colors.primary,
    ...typography.caption,
  },
});
