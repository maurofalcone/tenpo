import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Icon, Text } from "@/ui";
import { FavoriteButton } from "@/features/favorites";
import { resolveArtworkImageUrl } from "@/lib/api/artworks";
import type { ArtworkSummary } from "@/lib/api/types";
import {
  loadDailyArtwork,
  pickDailyIndex,
  saveDailyArtwork,
  shareArtwork,
  todayKey,
} from "@/lib/artwork";
import { colors, scrimAlpha } from "@/theme/colors";
import type { DailyArtworkCardProps } from "./DailyArtworkCard.types";
import { pickFreshDailyArtwork } from "./DailyArtworkCard.utils";

export type { DailyArtworkCardProps } from "./DailyArtworkCard.types";

const CARD_HEIGHT = 200;
const GRADIENT_HEIGHT = 120;

export function DailyArtworkCard({ candidates }: DailyArtworkCardProps) {
  const [artwork, setArtwork] = useState<ArtworkSummary | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const key = todayKey();
      const cached = await loadDailyArtwork();

      if (cached?.dateKey === key) {
        const next = pickFreshDailyArtwork(cached.artwork, candidates);
        if (!cancelled) {
          setArtwork(next);
        }
        if (
          next.image_url &&
          next.image_url !== cached.artwork.image_url
        ) {
          await saveDailyArtwork({ dateKey: key, artwork: next });
        }
        return;
      }

      if (candidates.length === 0) {
        return;
      }

      const picked = candidates[pickDailyIndex(key, candidates.length)];
      await saveDailyArtwork({ dateKey: key, artwork: picked });
      if (!cancelled) {
        setArtwork(picked);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  if (!artwork) {
    return null;
  }

  // Home siempre online: preferí URL remota (evita file:// de favoritos roto).
  const imageUrl =
    artwork.image_url?.trim() ||
    resolveArtworkImageUrl(artwork) ||
    null;

  const onShare = async () => {
    if (sharing) {
      return;
    }
    setSharing(true);
    try {
      await shareArtwork({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist_display,
      });
    } catch {
      Alert.alert("No se pudo compartir", "Probá de nuevo en un momento.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <View
      className="mb-5 overflow-hidden rounded-[18px] bg-border dark:bg-border-dark"
      style={{ height: CARD_HEIGHT, width: "100%" }}
      accessibilityRole="summary"
      accessibilityLabel={`Obra del día: ${artwork.title}`}
    >
      <Pressable
        onPress={() => router.push(`/(app)/artwork/${artwork.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${artwork.title || "obra del día"}`}
        style={styles.fill}
      >
        {imageUrl ? (
          <Image
            key={imageUrl}
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View
            style={styles.image}
            className="items-center justify-center bg-border dark:bg-border-dark"
            accessibilityLabel="Sin imagen"
          />
        )}

        {/* Solo franja inferior (como Featured): un fill completo puede tapar la foto. */}
        <LinearGradient
          pointerEvents="none"
          colors={[scrimAlpha(0), scrimAlpha(0.82)]}
          locations={[0, 1]}
          style={styles.gradient}
        />

        <View
          pointerEvents="none"
          className="absolute bottom-3.5 left-4 right-4 gap-0.5"
        >
          <Text
            variant="caption"
            onMedia
            muted
            className="text-[11px] font-semibold uppercase tracking-wide"
          >
            Obra del día
          </Text>
          <Text variant="subtitle" onMedia numberOfLines={2}>
            {artwork.title || "Sin título"}
          </Text>
          <Text variant="caption" onMedia muted numberOfLines={1}>
            {artwork.artist_display || "Artista desconocido"}
          </Text>
        </View>
      </Pressable>

      <View
        className="absolute right-2.5 top-2.5 flex-row items-center gap-1.5"
        pointerEvents="box-none"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-scrim/40">
          <FavoriteButton artwork={artwork} size={20} tone="onMedia" />
        </View>
        <Pressable
          onPress={onShare}
          disabled={sharing}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Compartir obra del día"
          className="h-9 w-9 items-center justify-center rounded-full bg-scrim/40"
          style={{ opacity: sharing ? 0.5 : 1 }}
        >
          <Icon name="share-outline" size={20} color={colors.onMedia} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: GRADIENT_HEIGHT,
  },
});
