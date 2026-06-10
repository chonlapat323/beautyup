import { Text } from "react-native";
import { fonts } from "@/theme";

type HtmlPart = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

export function parseSimpleHtml(html: string): HtmlPart[] {
  const normalized = html
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/ul>/gi, "")
    .replace(/<ul[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trimEnd()
    .replace(/\n$/, "");

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

export function HtmlText({ html, style, numberOfLines }: { html: string; style?: object; numberOfLines?: number }) {
  const parts = parseSimpleHtml(html);
  if (parts.length === 0) return null;
  return (
    <Text numberOfLines={numberOfLines} style={style}>
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
