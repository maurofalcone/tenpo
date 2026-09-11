import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import RenderHtml, {
  defaultSystemFonts,
  type MixedStyleDeclaration,
} from "react-native-render-html";
import { wrapRichHtml } from "@/lib/html/museum";
import { useTheme } from "@/providers/ThemeProvider";

type HtmlContentProps = {
  html: string;
  muted?: boolean;
  /** Ancho usable; por defecto pantalla menos padding horizontal de detalle (40). */
  contentWidth?: number;
};

export function HtmlContent({
  html,
  muted = false,
  contentWidth,
}: HtmlContentProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const resolvedWidth = contentWidth ?? Math.max(0, width - 40);
  const source = useMemo(() => ({ html: wrapRichHtml(html) }), [html]);

  const baseStyle = useMemo<MixedStyleDeclaration>(
    () => ({
      color: muted ? colors.muted : colors.text,
      fontSize: 15,
      lineHeight: 22,
    }),
    [colors.muted, colors.text, muted],
  );

  const tagsStyles = useMemo(
    () => ({
      body: baseStyle,
      p: {
        marginTop: 0,
        marginBottom: 8,
      },
      em: { fontStyle: "italic" as const },
      i: { fontStyle: "italic" as const },
      strong: { fontWeight: "600" as const },
      b: { fontWeight: "600" as const },
      a: {
        color: colors.accent,
        textDecorationLine: "underline" as const,
      },
      ul: { marginTop: 4, marginBottom: 8, paddingLeft: 18 },
      ol: { marginTop: 4, marginBottom: 8, paddingLeft: 18 },
      li: { marginBottom: 4 },
    }),
    [baseStyle, colors.accent],
  );

  if (!source.html) {
    return null;
  }

  return (
    <RenderHtml
      contentWidth={resolvedWidth}
      source={source}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
      systemFonts={defaultSystemFonts}
      defaultTextProps={{ selectable: true }}
      enableCSSInlineProcessing
    />
  );
}
