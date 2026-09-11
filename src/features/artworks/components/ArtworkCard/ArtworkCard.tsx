import { Image, Pressable, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { Text } from "@/ui";
import { FavoriteButton } from "@/features/favorites";
import { resolveArtworkImageUrl } from "@/lib/api/artworks";
import type { ArtworkCardProps } from "./ArtworkCard.types";
import { GAP, H_PAD } from "./ArtworkCard.utils";

export { ARTWORK_CARD_LAYOUT } from "./ArtworkCard.utils";
export type { ArtworkCardProps } from "./ArtworkCard.types";

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - H_PAD * 2 - GAP) / 2;
  const imageUrl = resolveArtworkImageUrl(artwork, 843);

  return (
    <Pressable
      onPress={() => router.push(`/(app)/artwork/${artwork.id}`)}
      className="overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark"
      style={{ width: cardWidth }}
      accessibilityRole="button"
      accessibilityLabel={artwork.title}
    >
      <View className="aspect-[0.78] w-full bg-border dark:bg-border-dark">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text muted variant="caption">
              Sin img
            </Text>
          </View>
        )}
        <View className="absolute right-1.5 top-1.5 rounded-full bg-surface p-0.5 dark:bg-surface-dark">
          <FavoriteButton artwork={artwork} size={20} />
        </View>
      </View>

      <View className="gap-1 px-2.5 pb-3 pt-2.5">
        <Text variant="label" numberOfLines={2}>
          {artwork.title || "Sin título"}
        </Text>
        <Text muted variant="caption" numberOfLines={1}>
          {artwork.artist_display || "Artista desconocido"}
        </Text>
      </View>
    </Pressable>
  );
}
