import type { PaletteToken } from "@/theme/palette";
import type { ButtonSize, ButtonVariant } from "./Button.types";

export const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-accent dark:bg-accent-dark",
  ghost: "bg-transparent border border-border dark:border-border-dark",
  danger: "bg-danger dark:bg-danger-dark",
};

export const textToken: Record<ButtonVariant, PaletteToken> = {
  primary: "onAccent",
  ghost: "text",
  danger: "onAccent",
};

export const sizeClass: Record<ButtonSize, string> = {
  md: "h-12 px-4",
  lg: "h-14 px-5",
};
