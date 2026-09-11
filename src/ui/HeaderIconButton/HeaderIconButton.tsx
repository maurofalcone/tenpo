import { Pressable, Text as RNText, View } from "react-native";
import { router } from "expo-router";
import { Icon, type IconName } from "../Icon";
import { Spinner } from "../Spinner";

type HeaderIconButtonProps = {
  name: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
  /** Reemplaza el ícono por un spinner (p. ej. export PDF). */
  loading?: boolean;
  /** Label chico debajo del ícono. */
  label?: string;
};

/** Ícono de header minimal: sin fondo ni glass. */
export function HeaderIconButton({
  name,
  accessibilityLabel,
  onPress,
  size = 22,
  disabled,
  loading,
  label,
}: HeaderIconButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      className={`items-center justify-start px-1 py-0.5 ${label ? "w-[66px] px-0.5" : ""}`}
      style={({ pressed }) => ({
        opacity: loading ? 1 : isDisabled ? 0.35 : pressed ? 0.45 : 1,
      })}
    >
      <View className="h-6 w-full items-center justify-center">
        {loading ? (
          <Spinner size="small" color="text" testID="header-icon-loading" />
        ) : (
          <Icon name={name} size={size} color={disabled ? "muted" : "text"} />
        )}
      </View>
      {label ? (
        <RNText
          numberOfLines={2}
          className="mt-0.5 w-full text-center text-[9px] font-medium leading-[11px] text-muted dark:text-muted-dark"
        >
          {label}
        </RNText>
      ) : null}
    </Pressable>
  );
}

export function HeaderBackButton() {
  return (
    <HeaderIconButton
      name="chevron-back"
      accessibilityLabel="Volver"
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace("/(app)/(tabs)");
      }}
    />
  );
}
