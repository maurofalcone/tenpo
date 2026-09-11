import type { TextProps as RNTextProps } from "react-native";

export type TextVariant = "title" | "subtitle" | "body" | "caption" | "label";

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  muted?: boolean;
  danger?: boolean;
  /**
   * Texto sobre media/scrim oscuro: siempre claro (no sigue el tema).
   * Con `muted` usa el tono on-media atenuado.
   */
  onMedia?: boolean;
  className?: string;
};
