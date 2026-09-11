import { darkPalette, lightPalette } from "./palette";
import { hexToRgba } from "./color";

/**
 * Tokens fijos para sitios donde NativeWind no llega bien
 * (LinearGradient, Icon color, style props, overlays sobre fotos).
 * Preferí `className` con tokens de Tailwind cuando sea posible.
 */
export const colors = {
  light: lightPalette,
  dark: darkPalette,

  /** Texto / UI sobre imagen oscura (independiente del tema de la app). */
  onMedia: "#F8F4EE",
  /** Fondo lavado del hero de login. */
  loginHero: "#2A2622",
  /** Corazón activo sobre media. */
  heartOnMedia: "#FF6B6B",
  /** Scrim base (= dark.bg). */
  scrim: darkPalette.bg,
  white: "#FFFFFF",
  black: "#000000",
  /** Tono secundario (p. ej. subtítulo de artista en PDF). */
  inkSoft: "#57534E",
  /** Cuerpo de texto denso (HTML rico en PDF). */
  inkBody: "#44403C",
} as const;

export type OverlayColorKey = keyof typeof colors;

/** Cream sobre media con alpha (texto muted, etc.). */
export function onMediaAlpha(alpha: number) {
  return hexToRgba(colors.onMedia, alpha);
}

/** Scrim oscuro sobre fotos / mosaicos. */
export function scrimAlpha(alpha: number) {
  return hexToRgba(colors.scrim, alpha);
}

/** Backdrop del modal sheet. */
export function backdropAlpha(alpha = 0.5) {
  return hexToRgba(colors.black, alpha);
}

/** Blanco semitransparente (bordes de selección sobre media). */
export function whiteAlpha(alpha: number) {
  return hexToRgba(colors.white, alpha);
}
