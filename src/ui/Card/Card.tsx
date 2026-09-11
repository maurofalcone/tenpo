import { TouchableOpacity, View, type ViewProps } from "react-native";

type CardProps = {
  className?: string;
  pressable?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: ViewProps["style"];
};

export function Card({
  children,
  className = "",
  pressable = false,
  onPress,
  activeOpacity = 0.75,
  disabled,
  style,
}: CardProps) {
  const base = `rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 ${className}`.trim();

  if (pressable || onPress) {
    return (
      <TouchableOpacity
        className={base}
        onPress={onPress}
        activeOpacity={activeOpacity}
        disabled={disabled}
        style={style}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={base} style={style}>
      {children}
    </View>
  );
}
