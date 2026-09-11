import {
  Image,
  Modal as RNModal,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, Text } from "@/ui";
import { useTheme } from "@/providers/ThemeProvider";
import { ExportArtworkPdfButton } from "../ExportArtworkPdfButton";
import { ShareArtworkButton } from "../ShareArtworkButton";
import type { ArtworkImagePreviewModalProps } from "./ArtworkImagePreviewModal.types";

export type { ArtworkImagePreviewModalProps } from "./ArtworkImagePreviewModal.types";

export function ArtworkImagePreviewModal({
  visible,
  artwork,
  imageUrl,
  onClose,
}: ArtworkImagePreviewModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1" style={{ backgroundColor: colors.bg }}>
        <View
          className="z-10 flex-row items-center justify-between px-4"
          style={{ paddingTop: Math.max(insets.top, 12) }}
        >
          <Text variant="subtitle" className="min-w-0 flex-1 pr-3" numberOfLines={1}>
            {artwork.title?.trim() || "Obra"}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cerrar imagen ampliada"
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Icon name="close" size={22} color="muted" />
          </Pressable>
        </View>

        <View
          className="min-h-0 flex-1 items-center justify-center px-4"
          style={{ backgroundColor: colors.bg }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="h-full w-full"
              resizeMode="contain"
              accessibilityIgnoresInvertColors
              accessibilityLabel={artwork.title || "Imagen de la obra"}
            />
          ) : (
            <Text muted>Sin imagen</Text>
          )}
        </View>

        <View
          className="flex-row items-center justify-center gap-6 border-t border-border px-5 dark:border-border-dark"
          style={{
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor: colors.bg,
          }}
          accessibilityRole="toolbar"
        >
          <ExportArtworkPdfButton artwork={artwork} />
          <ShareArtworkButton
            id={artwork.id}
            title={artwork.title}
            artist={artwork.artist_display}
          />
        </View>
      </View>
    </RNModal>
  );
}

export default ArtworkImagePreviewModal;
