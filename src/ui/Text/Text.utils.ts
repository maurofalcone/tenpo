import type { TextVariant } from "./Text.types";

/** Tipografía sin color: el tono lo define `toneClass`. */
export const variantClass: Record<TextVariant, string> = {
  title: "text-2xl font-semibold",
  subtitle: "text-lg font-medium",
  body: "text-base",
  caption: "text-sm",
  label: "text-sm font-medium",
};

export const toneClass = {
  default: "text-text dark:text-text-dark",
  muted: "text-muted dark:text-muted-dark",
  danger: "text-danger dark:text-danger-dark",
  /** Texto sobre imagen / scrim oscuro (siempre claro). */
  onMedia: "text-on-media",
  onMediaMuted: "text-on-media/80",
} as const;
