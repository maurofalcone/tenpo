import { View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../Text";

type TextLinkProps = {
  children: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** Link de texto con subrayado un poco más separado de las letras. */
export function TextLink({ children, className = "", style }: TextLinkProps) {
  return (
    <View
      className={`self-start border-b-[1.5px] border-accent pb-0.5 dark:border-accent-dark ${className}`}
      style={style}
    >
      <Text
        variant="label"
        className="leading-5 text-accent dark:text-accent-dark"
      >
        {children}
      </Text>
    </View>
  );
}
