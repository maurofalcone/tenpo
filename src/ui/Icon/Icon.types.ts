import type { ColorValue, StyleProp, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PaletteToken } from "@/theme/palette";

export type IconName = keyof typeof Ionicons.glyphMap;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: PaletteToken | ColorValue;
  style?: StyleProp<TextStyle>;
  testID?: string;
};
