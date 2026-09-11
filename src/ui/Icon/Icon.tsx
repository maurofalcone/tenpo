import { Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import type { PaletteToken } from "@/theme/palette";
import type { IconProps } from "./Icon.types";

export type { IconName, IconProps } from "./Icon.types";

export function Icon({
  name,
  size = 22,
  color = "text",
  style,
  testID,
}: IconProps) {
  const { colors } = useTheme();
  const resolved =
    typeof color === "string" && color in colors
      ? colors[color as PaletteToken]
      : (color as string);

  return (
    <Ionicons
      name={name}
      size={size}
      color={resolved}
      testID={testID}
      style={[
        {
          width: size,
          height: size,
          lineHeight: size,
          textAlign: "center",
        },
        Platform.OS === "android" ? styles.android : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  android: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
