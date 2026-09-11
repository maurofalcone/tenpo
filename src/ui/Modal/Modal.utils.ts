import { Dimensions, type KeyboardEvent } from "react-native";

export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const SHEET_OFFSET = Math.min(SCREEN_HEIGHT * 0.9, 640);
/** Duración de la animación del sheet (abrir / cerrar). */
export const MODAL_SHEET_MS = 280;

export function keyboardOverlap(event: KeyboardEvent) {
  const windowHeight = Dimensions.get("window").height;
  const { height, screenY } = event.endCoordinates;

  if (typeof screenY === "number" && screenY > 0 && screenY < windowHeight) {
    return Math.max(0, windowHeight - screenY);
  }

  return Math.max(0, height);
}
