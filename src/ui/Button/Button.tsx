import {
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import { Spinner } from "../Spinner";
import { Icon } from "../Icon";
import { useTheme } from "@/providers/ThemeProvider";
import type { ButtonProps } from "./Button.types";
import { sizeClass, textToken, variantClass } from "./Button.utils";

export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./Button.types";

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  leftIcon,
  className = "",
  activeOpacity = 0.7,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = Boolean(disabled || loading);
  const labelColor = colors[textToken[variant]];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      activeOpacity={activeOpacity}
      className={`flex-row items-center justify-center rounded-xl ${sizeClass[size]} ${variantClass[variant]} ${isDisabled ? "opacity-50" : "opacity-100"} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <Spinner color={textToken[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon ? (
            <Icon name={leftIcon} size={18} color={textToken[variant]} />
          ) : null}
          <RNText
            style={{ color: labelColor, fontSize: 16, fontWeight: "600" }}
          >
            {title}
          </RNText>
        </View>
      )}
    </TouchableOpacity>
  );
}
