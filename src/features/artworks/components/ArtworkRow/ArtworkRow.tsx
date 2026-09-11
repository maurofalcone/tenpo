import { Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "@/ui";
import { FavoriteButton } from "@/features/favorites";
import { resolveArtworkImageUrl } from "@/lib/api/artworks";
import type { ArtworkRowProps } from "./ArtworkRow.types";

export type { ArtworkRowProps } from "./ArtworkRow.types";

export function ArtworkRow({ artwork }: ArtworkRowProps) {
  const imageUrl = resolveArtworkImageUrl(artwork, 200);

  return (
    <Pressable
      onPress={() => router.push(`/(app)/artwork/${artwork.id}`)}
      className="flex-row items-center gap-3 border-b border-border px-5 py-3 dark:border-border-dark"
      accessibilityRole="button"
      accessibilityLabel={artwork.title}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-[72px] w-[72px] rounded-xl bg-border dark:bg-border-dark"
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View className="h-[72px] w-[72px] items-center justify-center rounded-xl bg-border dark:bg-border-dark">
          <Text muted variant="caption">
            Sin img
          </Text>
        </View>
      )}
      <View className="flex-1 gap-1">
        <Text variant="label" numberOfLines={2}>
          {artwork.title || "Sin título"}
        </Text>
        <Text muted variant="caption" numberOfLines={1}>
          {artwork.artist_display || "Artista desconocido"}
        </Text>
        <View className="mt-1 self-start rounded-full bg-border px-2 py-0.5 dark:bg-border-dark">
          <Text variant="caption" muted>
            {artwork.date_display || artwork.classification_title || "Obra"}
          </Text>
        </View>
      </View>
      <FavoriteButton artwork={artwork} />
    </Pressable>
  );
}
