import { useCallback, useState } from "react";
import { Dimensions, Image, ScrollView, View } from "react-native";
import { Redirect, Stack, router, useLocalSearchParams } from "expo-router";
import {
  EmptyState,
  ExpandImageButton,
  Modal,
  Screen,
  ScreenBody,
  Text,
  minimalStackHeaderOptions,
} from "@/ui";
import { resolveArtworkImageUrl } from "@/lib/api/artworks";
import type { ArtworkSummary } from "@/lib/api/types";
import { useFavorites } from "@/providers/FavoritesProvider";
import { parseCompareIds } from "./CompareScreen.utils";

const LABEL_WIDTH = 108;
const H_PAD = 20;
const HERO_HEIGHT = 148;

const COMPARE_ROWS: {
  key: string;
  label: string;
  value: (artwork: ArtworkSummary) => string;
}[] = [
  {
    key: "title",
    label: "Título",
    value: (artwork) => artwork.title?.trim() || "Sin título",
  },
  {
    key: "artist",
    label: "Artista",
    value: (artwork) => artwork.artist_display?.trim() || "—",
  },
  {
    key: "date",
    label: "Fecha",
    value: (artwork) => artwork.date_display?.trim() || "—",
  },
  {
    key: "classification",
    label: "Clasificación",
    value: (artwork) => artwork.classification_title?.trim() || "—",
  },
];

function CompareHero({
  artwork,
  onExpand,
}: {
  artwork: ArtworkSummary;
  onExpand: () => void;
}) {
  const imageUrl = resolveArtworkImageUrl(artwork);

  return (
    <View
      className="overflow-hidden rounded-xl bg-border dark:bg-border-dark"
      style={{ height: HERO_HEIGHT, width: "100%" }}
      accessibilityLabel={artwork.title || "Obra"}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View className="h-full w-full items-center justify-center px-2">
          <Text muted className="text-center text-xs">
            Sin imagen
          </Text>
        </View>
      )}

      {imageUrl ? (
        <ExpandImageButton
          onPress={onExpand}
          className="absolute bottom-2 right-2"
        />
      ) : null}
    </View>
  );
}

function CompareTable({
  artworks,
  onExpand,
}: {
  artworks: ArtworkSummary[];
  onExpand: (artwork: ArtworkSummary) => void;
}) {
  const screenWidth = Dimensions.get("window").width;
  const available = screenWidth - H_PAD * 2 - LABEL_WIDTH;
  const colWidth = Math.max(
    104,
    Math.floor(available / Math.min(artworks.length, 3)),
  );
  const tableWidth = LABEL_WIDTH + colWidth * artworks.length;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={artworks.length > 3}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: tableWidth }}>
        <View className="flex-row border-b border-border pb-3 dark:border-border-dark">
          <View style={{ width: LABEL_WIDTH }} />
          {artworks.map((artwork) => (
            <View
              key={artwork.id}
              style={{ width: colWidth }}
              className="px-1.5"
            >
              <CompareHero
                artwork={artwork}
                onExpand={() => onExpand(artwork)}
              />
            </View>
          ))}
        </View>

        {COMPARE_ROWS.map((row) => (
          <View
            key={row.key}
            className="flex-row border-b border-border py-3 dark:border-border-dark"
          >
            <View
              style={{ width: LABEL_WIDTH }}
              className="justify-center pr-1"
            >
              <Text variant="caption" muted numberOfLines={1}>
                {row.label}
              </Text>
            </View>
            {artworks.map((artwork) => (
              <View
                key={`${row.key}-${artwork.id}`}
                style={{ width: colWidth }}
                className="px-1.5"
              >
                <Text numberOfLines={row.key === "title" ? 4 : row.key === "classification" ? 1 : 3}>
                  {row.value(artwork)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ComparePreviewModal({
  artwork,
  visible,
  onClose,
}: {
  artwork: ArtworkSummary | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!artwork) {
    return null;
  }

  const imageUrl = resolveArtworkImageUrl(artwork);
  const maxHeight = Math.round(Dimensions.get("window").height * 0.52);

  return (
    <Modal
      visible={visible}
      title={artwork.title?.trim() || "Obra"}
      onClose={onClose}
      closeAccessibilityLabel="Cerrar imagen ampliada"
    >
      <View className="gap-3">
        {imageUrl ? (
          <View
            className="w-full items-center justify-center overflow-hidden rounded-2xl bg-border dark:bg-border-dark"
            style={{ height: maxHeight }}
          >
            <Image
              source={{ uri: imageUrl }}
              className="h-full w-full"
              resizeMode="contain"
              accessibilityIgnoresInvertColors
              accessibilityLabel={artwork.title || "Imagen de la obra"}
            />
          </View>
        ) : (
          <View className="h-40 items-center justify-center rounded-2xl bg-border dark:bg-border-dark">
            <Text muted>Sin imagen</Text>
          </View>
        )}
        {artwork.artist_display?.trim() ? (
          <Text muted numberOfLines={2}>
            {artwork.artist_display.trim()}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

export default function CompareScreen() {
  const { favorites } = useFavorites();
  const params = useLocalSearchParams<{
    ids?: string | string[];
    left?: string;
    right?: string;
  }>();
  const [preview, setPreview] = useState<ArtworkSummary | null>(null);

  const fromIds = parseCompareIds(params.ids);
  const compareIds =
    fromIds.length >= 2
      ? fromIds
      : parseCompareIds(
          [params.left, params.right].filter(Boolean).join(","),
        );

  const onExpand = useCallback((artwork: ArtworkSummary) => {
    setPreview(artwork);
  }, []);

  const onClosePreview = useCallback(() => {
    setPreview(null);
  }, []);

  if (compareIds.length < 2) {
    return <Redirect href="/(app)/(tabs)/favorites" />;
  }

  const artworks = compareIds
    .map((id) => favorites.find((item) => item.id === id))
    .filter((item): item is ArtworkSummary => Boolean(item));

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <Stack.Screen
        options={
          {
            ...minimalStackHeaderOptions,
          } as object
        }
      />
      <ScreenBody padded={false}>
        {artworks.length < 2 ? (
          <EmptyState
            title="No se pueden comparar"
            description="Seleccioná entre 2 y 4 obras que estén en Favoritos."
            icon="git-compare-outline"
            actionTitle="Volver a Favoritos"
            onAction={() => router.replace("/(app)/(tabs)/favorites")}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: H_PAD,
              paddingTop: 8,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <CompareTable artworks={artworks} onExpand={onExpand} />
          </ScrollView>
        )}
      </ScreenBody>

      <ComparePreviewModal
        artwork={preview}
        visible={Boolean(preview)}
        onClose={onClosePreview}
      />
    </Screen>
  );
}
