import { Pressable, StyleSheet, Text, View } from "react-native";

import { CommerceImageBackground } from "@/components/ui/CommerceImage";
import { colors, radius, spacing, typography } from "@/theme";

type HeroSlideProps = {
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  imageUrl?: string;
  onPress: () => void;
};

const cardShadow = {
  shadowColor: "#8A6870",
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 4,
} as const;

export function HeroSlide({
  eyebrow,
  title,
  body,
  buttonLabel,
  imageUrl,
  onPress,
}: HeroSlideProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </View>

      <CommerceImageBackground
        imageStyle={styles.visualImage}
        style={styles.visual}
        uri={imageUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flexDirection: "row",
    overflow: "hidden",
    ...cardShadow,
  },
  copy: {
    flex: 1,
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    textTransform: "uppercase",
    ...typography.eyebrow,
  },
  title: {
    color: colors.textPrimary,
    maxWidth: 180,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "600",
  },
  body: {
    color: colors.textSecondary,
    ...typography.body,
  },
  button: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: "#FFFFFF",
    ...typography.caption,
  },
  visual: {
    width: 128,
  },
  visualImage: {
    borderRadius: radius.lg,
  },
});
