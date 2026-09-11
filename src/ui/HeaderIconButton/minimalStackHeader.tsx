import { HeaderBackButton } from "./HeaderIconButton";

/**
 * Header stack minimalista: solo chevron atrás, sin título ni Liquid Glass.
 * Usar en pantallas tipo detalle / comparar.
 */
export const minimalStackHeaderOptions = {
  title: "",
  headerBackVisible: false,
  headerLeftBackgroundVisible: false,
  headerRightBackgroundVisible: false,
  unstable_headerLeftItems: () => [
    {
      type: "custom" as const,
      hidesSharedBackground: true,
      element: <HeaderBackButton />,
    },
  ],
};
