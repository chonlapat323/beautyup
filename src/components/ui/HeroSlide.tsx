import { Pressable, StyleSheet, Text, View } from "react-native";

import { CommerceImageBackground } from "@/components/ui/CommerceImage";
import { colors, fonts, radius, spacing, typography } from "@/theme";

type HtmlPart = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

function parseSimpleHtml(html: string): HtmlPart[] {
  // Normalize TipTap block-level tags → inline newlines before parsing inline styles
  const normalized = html
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/ul>/gi, "")
    .replace(/<ul[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .trimEnd()
    .replace(/\n$/, ""); // strip trailing newline from last </p>

  const parts: HtmlPart[] = [];
  const regex = /<(\/?)(b|strong|i|em|u|s)>/gi;
  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      const chunk = normalized.slice(lastIndex, match.index).replace(/<[^>]+>/g, "");
      if (chunk) parts.push({ text: chunk, bold, italic, underline, strikethrough });
    }
    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();
    if (tag === "b" || tag === "strong") bold = !closing;
    if (tag === "i" || tag === "em") italic = !closing;
    if (tag === "u") underline = !closing;
    if (tag === "s") strikethrough = !closing;
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < normalized.length) {
    const tail = normalized.slice(lastIndex).replace(/<[^>]+>/g, "");
    if (tail) parts.push({ text: tail, bold, italic, underline, strikethrough });
  }

  return parts;
}

function HtmlText({ html, style }: { html: string; style: object }) {
  const parts = parseSimpleHtml(html);
  if (parts.length === 0) return null;
  return (
    <Text style={style}>
      {parts.map((p, i) => {
        const decoration =
          p.underline && p.strikethrough ? "underline line-through"
          : p.underline ? "underline"
          : p.strikethrough ? "line-through"
          : undefined;
        return (
          <Text
            key={i}
            style={[
              p.bold ? { fontFamily: fonts.bold } : undefined,
              p.italic ? { fontStyle: "italic" as const } : undefined,
              decoration ? { textDecorationLine: decoration as "underline" | "line-through" | "underline line-through" } : undefined,
            ]}
          >
            {p.text}
          </Text>
        );
      })}
    </Text>
  );
}

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
        <HtmlText html={body} style={styles.body} />

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
    // ทองบน eyebrow — บ่งบอกความพิเศษของ collection
    color: colors.gold,
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
    // ปุ่มทองคำแท้ — CTA ที่โดดเด่นบนพื้นขาว
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    // ข้อความเข้มบนทอง — contrast ดี อ่านง่าย
    color: colors.goldDark,
    ...typography.caption,
    fontWeight: "700",
  },
  visual: {
    width: 128,
  },
  visualImage: {
    borderRadius: radius.lg,
  },
});
