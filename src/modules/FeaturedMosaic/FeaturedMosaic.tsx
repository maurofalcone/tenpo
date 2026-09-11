import { useMemo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Icon, Text } from "@/ui";
import { resolveArtworkImageUrl } from "@/lib/api/artworks";
import { useTheme } from "@/providers/ThemeProvider";
import { scrimAlpha, whiteAlpha } from "@/theme/colors";
import type {
  FeaturedMosaicListProps,
  FeaturedMosaicProps,
  FeaturedTileProps,
} from "./FeaturedMosaic.types";
import {
  distributeColumns,
  getArtworkAspectRatio,
} from "./FeaturedMosaic.utils";

export { getArtworkAspectRatio } from "./FeaturedMosaic.utils";
export type {
  FeaturedMosaicListProps,
  FeaturedMosaicProps,
  FeaturedTileProps,
} from "./FeaturedMosaic.types";

function FeaturedTile({
  artwork,
  style,
  selectionMode = false,
  selected = false,
  onToggleSelect,
  onEnterSelect,
}: FeaturedTileProps) {
  const { colors } = useTheme();
  const imageUrl = resolveArtworkImageUrl(artwork);
  const aspectRatio = getArtworkAspectRatio(artwork);
  const compact = aspectRatio >= 1;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        if (selectionMode) {
          onToggleSelect?.(artwork);
          return;
        }
        router.push(`/(app)/artwork/${artwork.id}`);
      }}
      onLongPress={() => {
        if (selectionMode) {
          onToggleSelect?.(artwork);
          return;
        }
        onEnterSelect?.(artwork);
      }}
      delayLongPress={320}
      className="w-full overflow-hidden rounded-2xl bg-border dark:bg-border-dark"
      style={[
        { aspectRatio },
        selected && {
          borderWidth: 2,
          borderColor: colors.accent,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={artwork.title}
      accessibilityHint={
        selectionMode
          ? "Toca para seleccionar o deseleccionar"
          : "Toca para ver detalle. Mantené presionado para seleccionar"
      }
      accessibilityState={selectionMode ? { selected } : undefined}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View className="absolute inset-0 items-center justify-center bg-border dark:bg-border-dark">
          <Text muted variant="caption">
            Sin imagen
          </Text>
        </View>
      )}
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", scrimAlpha(0.72)]}
        locations={[0, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: compact ? 72 : 110,
        }}
      />
      <View
        className={`absolute bottom-0 left-0 right-0 ${
          compact ? "px-2.5 pb-2.5 pt-3.5" : "px-3.5 pb-3.5 pt-5"
        }`}
      >
        <Text
          variant={compact ? "caption" : "label"}
          onMedia
          numberOfLines={compact ? 2 : 3}
          className="font-semibold"
        >
          {artwork.title || "Sin título"}
        </Text>
        {!compact ? (
          <Text
            variant="caption"
            onMedia
            muted
            numberOfLines={1}
            className="mt-0.5"
          >
            {artwork.artist_display || "Artista desconocido"}
          </Text>
        ) : null}
      </View>

      {selectionMode ? (
        <View
          className="absolute right-2.5 top-2.5 h-6 w-6 items-center justify-center rounded-full border-2"
          style={{
            backgroundColor: selected ? colors.accent : scrimAlpha(0.45),
            borderColor: selected ? colors.accent : whiteAlpha(0.7),
          }}
        >
          {selected ? (
            <Icon name="checkmark" size={14} color="onAccent" />
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

/** Masonry continuo de 2 columnas (sin chunks → menos gaps). */
export function FeaturedMosaic({
  artworks,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
  onEnterSelect,
}: FeaturedMosaicProps) {
  const { left, right } = useMemo(
    () => distributeColumns(artworks),
    [artworks],
  );

  if (artworks.length === 0) {
    return null;
  }

  const tileProps = {
    selectionMode,
    onToggleSelect,
    onEnterSelect,
  };

  if (artworks.length === 1) {
    return (
      <FeaturedTile
        artwork={artworks[0]}
        selected={selectedIds?.has(artworks[0].id) ?? false}
        {...tileProps}
      />
    );
  }

  return (
    <View className="flex-row items-start gap-2">
      <View className="flex-1 gap-2">
        {left.map((artwork) => (
          <FeaturedTile
            key={artwork.id}
            artwork={artwork}
            selected={selectedIds?.has(artwork.id) ?? false}
            {...tileProps}
          />
        ))}
      </View>
      <View className="flex-1 gap-2">
        {right.map((artwork) => (
          <FeaturedTile
            key={artwork.id}
            artwork={artwork}
            selected={selectedIds?.has(artwork.id) ?? false}
            {...tileProps}
          />
        ))}
      </View>
    </View>
  );
}

export function FeaturedMosaicList({ artworks }: FeaturedMosaicListProps) {
  return <FeaturedMosaic artworks={artworks} />;
}
