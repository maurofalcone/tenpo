import {
  ActivityIndicator,
  type ActivityIndicatorProps,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { PaletteToken } from "@/theme/palette";

type SpinnerProps = {
  color?: PaletteToken | string;
  size?: ActivityIndicatorProps["size"];
  testID?: string;
};

export function Spinner({
  color = "accent",
  size = "small",
  testID,
}: SpinnerProps) {
  const { colors } = useTheme();
  const resolved =
    color in colors ? colors[color as PaletteToken] : (color as string);

  return (
    <ActivityIndicator
      accessibilityRole="progressbar"
      color={resolved}
      size={size}
      testID={testID}
    />
  );
}
