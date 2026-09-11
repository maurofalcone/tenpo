import { forwardRef, useState } from "react";
import {
  Platform,
  Text as RNText,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Text } from "../Text";
import { useTheme } from "@/providers/ThemeProvider";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  /** Si true, no reserva espacio bajo el input cuando no hay error. */
  compact?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    disabled,
    editable,
    className = "",
    compact = false,
    onFocus,
    onBlur,
    style,
    ...props
  },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const isDisabled = Boolean(disabled);
  const canEdit = editable !== false && !isDisabled;

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.accent
      : colors.border;

  return (
    <View className={`${isDisabled ? "opacity-50" : ""}`}>
      <Text variant="label">{label}</Text>
      <TextInput
        ref={ref}
        editable={canEdit}
        placeholderTextColor={colors.muted}
        className={`mt-1.5 h-14 rounded-xl border text-base text-text dark:text-text-dark bg-surface dark:bg-surface-dark ${className}`.trim()}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...props}
        style={[
          {
            borderColor,
            borderWidth: focused && !error ? 1.5 : 1,
            paddingHorizontal: 16,
            paddingVertical: 0,
            fontSize: 16,
            textAlignVertical: "center",
            ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
          },
          style,
        ]}
      />
      {error || !compact ? (
        <View
          className={`mt-1 justify-center ${compact ? "" : "min-h-[18px]"}`}
        >
          <RNText
            style={{ color: colors.danger, fontSize: 12, lineHeight: 16 }}
            numberOfLines={2}
          >
            {error ?? (compact ? null : " ")}
          </RNText>
        </View>
      ) : null}
    </View>
  );
});
