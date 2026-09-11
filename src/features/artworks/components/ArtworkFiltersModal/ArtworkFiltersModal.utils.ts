import { Dimensions } from "react-native";

export const FIELD_FONT_SIZE = 16;

/** Slide horizontal entre Filtros ↔ Clasificación. */
export const STEP_SLIDE_MS = 280;

export const FIELDS_MAX_HEIGHT = Math.round(
  Dimensions.get("window").height * 0.42,
);

/** mt-3 + border + pt-3 + Button md (h-12). */
export const ACTIONS_BAR_HEIGHT = 12 + 1 + 12 + 48;

/** Lista de clasificación: campos + hueco de Limpiar/Aplicar. */
export const CLASSIFICATION_LIST_HEIGHT =
  FIELDS_MAX_HEIGHT + ACTIONS_BAR_HEIGHT;
