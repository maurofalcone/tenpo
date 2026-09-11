import type { TouchableOpacityProps } from "react-native";
import type { IconName } from "../Icon";

export type ButtonVariant = "primary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

export type ButtonProps = Omit<TouchableOpacityProps, "children"> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconName;
  className?: string;
};
