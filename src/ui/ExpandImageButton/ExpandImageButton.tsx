import { Pressable } from "react-native";
import { colors } from "@/theme/colors";
import { Icon } from "../Icon";

type ExpandImageButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  className?: string;
};

/** CTA flotante para ampliar una imagen (detalle / comparar). */
export function ExpandImageButton({
  onPress,
  accessibilityLabel = "Ampliar imagen",
  className = "absolute bottom-3 right-3",
}: ExpandImageButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`${className} h-9 w-9 items-center justify-center rounded-full border border-border bg-surface dark:border-border-dark dark:bg-surface-dark`.trim()}
      style={{
        shadowColor: colors.black,
        shadowOpacity: 0.16,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      }}
    >
      <Icon name="expand-outline" size={18} color="text" />
    </Pressable>
  );
}
