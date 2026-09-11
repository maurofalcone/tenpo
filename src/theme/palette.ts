export type ColorScheme = "light" | "dark";

export type PaletteToken =
  | "bg"
  | "surface"
  | "text"
  | "muted"
  | "border"
  | "accent"
  | "danger"
  | "success"
  | "onAccent";

export type Palette = Record<PaletteToken, string>;

export const lightPalette: Palette = {
  bg: "#F6F1EA",
  surface: "#FFFFFF",
  text: "#1C1917",
  muted: "#78716C",
  border: "#E7E0D8",
  accent: "#1C1917",
  danger: "#B42318",
  success: "#027A48",
  onAccent: "#FFFFFF",
};

export const darkPalette: Palette = {
  bg: "#161412",
  surface: "#1F1C19",
  text: "#F5F0E8",
  muted: "#A8A29E",
  border: "#3F3A36",
  accent: "#F5F0E8",
  danger: "#F97066",
  success: "#6CE9A6",
  onAccent: "#161412",
};

export const palettes: Record<ColorScheme, Palette> = {
  light: lightPalette,
  dark: darkPalette,
};

export function getPalette(scheme: ColorScheme): Palette {
  return palettes[scheme];
}
