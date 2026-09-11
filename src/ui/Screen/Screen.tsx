import { View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
  className?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

export function Screen({
  children,
  className = "",
  edges = ["top", "bottom"],
  ...props
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 bg-bg dark:bg-bg-dark ${className}`.trim()}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}

type ScreenBodyProps = ViewProps & {
  className?: string;
  /** Padding horizontal por defecto (20). Pasá 0 para full-bleed. */
  padded?: boolean;
};

export function ScreenBody({
  children,
  className = "",
  padded = true,
  style,
  ...props
}: ScreenBodyProps) {
  return (
    <View
      className={`flex-1 ${className}`.trim()}
      style={[{ paddingHorizontal: padded ? 20 : 0 }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
