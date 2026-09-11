import { View } from "react-native";
import { Text } from "../Text";
import { Button } from "../Button";
import { Icon } from "../Icon";

type ErrorViewProps = {
  title?: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
};

export function ErrorView({
  title = "Algo salió mal",
  description,
  actionTitle = "Reintentar",
  onAction,
}: ErrorViewProps) {
  return (
    <View
      className="flex-1 items-center justify-center gap-3 px-8"
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${description}`}
    >
      <Icon name="alert-circle-outline" size={40} color="danger" />
      <Text variant="subtitle" className="text-center" accessibilityRole="header">
        {title}
      </Text>
      <Text muted className="text-center">
        {description}
      </Text>
      {onAction ? (
        <Button
          title={actionTitle}
          variant="ghost"
          onPress={onAction}
          className="mt-2 min-w-[160px]"
        />
      ) : null}
    </View>
  );
}
