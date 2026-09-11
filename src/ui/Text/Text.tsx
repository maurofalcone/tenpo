import { Text as RNText } from "react-native";
import type { TextProps } from "./Text.types";
import { toneClass, variantClass } from "./Text.utils";

export type { TextProps, TextVariant } from "./Text.types";

export function Text({
  variant = "body",
  muted,
  danger,
  onMedia,
  className = "",
  maxFontSizeMultiplier = 1.35,
  ...props
}: TextProps) {
  const tone = danger
    ? toneClass.danger
    : onMedia
      ? muted
        ? toneClass.onMediaMuted
        : toneClass.onMedia
      : muted
        ? toneClass.muted
        : toneClass.default;

  return (
    <RNText
      className={`${variantClass[variant]} ${tone} ${className}`.trim()}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    />
  );
}
