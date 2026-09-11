import { View } from "react-native";
import { Text } from "../Text";
import { Button } from "../Button";
import { Icon, type IconName } from "../Icon";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: IconName;
  actionTitle?: string;
  onAction?: () => void;
  secondaryActionTitle?: string;
  onSecondaryAction?: () => void;
};

export function EmptyState({
  title,
  description,
  icon = "file-tray-outline",
  actionTitle,
  onAction,
  secondaryActionTitle,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center gap-3 px-8"
      accessibilityRole="summary"
      accessibilityLabel={`${title}${description ? `. ${description}` : ""}`}
    >
      <Icon name={icon} size={40} color="muted" />
      <Text variant="subtitle" className="text-center" accessibilityRole="header">
        {title}
      </Text>
      {description ? (
        <Text muted className="text-center">
          {description}
        </Text>
      ) : null}
      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          variant="ghost"
          onPress={onAction}
          className="mt-2 min-w-[160px]"
        />
      ) : null}
      {secondaryActionTitle && onSecondaryAction ? (
        <Button
          title={secondaryActionTitle}
          variant="ghost"
          onPress={onSecondaryAction}
          className="min-w-[160px]"
        />
      ) : null}
    </View>
  );
}
