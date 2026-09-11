import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import {
  HEADER_BAR_HEIGHT,
  hexToRgba,
} from "./FadeHeaderBackground.utils";

export { HEADER_BAR_HEIGHT } from "./FadeHeaderBackground.utils";

/**
 * Fondo del top navigator: sólido en status bar + parte alta,
 * fade a transparente solo en el borde inferior de la barra.
 */
export function FadeHeaderBackground() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {/* Status bar + zona alta del nav: 100% opaco */}
      <View
        style={{
          height: insets.top + HEADER_BAR_HEIGHT * 0.45,
          backgroundColor: colors.bg,
        }}
      />
      {/* Fade contenido en la parte baja del navigator */}
      <LinearGradient
        colors={[colors.bg, hexToRgba(colors.bg, 0)]}
        className="h-full w-full flex-1"
      />
    </View>
  );
}

/** Padding superior del contenido cuando el header es transparente. */
export function useFadeHeaderContentInset(extra = 4) {
  const insets = useSafeAreaInsets();
  return insets.top + HEADER_BAR_HEIGHT + extra;
}

export const fadeHeaderScreenOptions = {
  headerShown: true,
  headerTransparent: true,
  headerShadowVisible: false,
  headerTitle: () => null,
  headerStyle: { backgroundColor: "transparent" },
  headerBackground: () => <FadeHeaderBackground />,
} as const;
