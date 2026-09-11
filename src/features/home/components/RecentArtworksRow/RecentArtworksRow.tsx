import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Text, TextLink } from "@/ui";
import { resolveArtworkImageUrl } from "@/lib/api/artworks";
import type { RecentArtworksRowProps } from "./RecentArtworksRow.types";

export type { RecentArtworksRowProps } from "./RecentArtworksRow.types";

const CARD_WIDTH = 112;
const CARD_HEIGHT = 148;

export function RecentArtworksRow({ artworks }: RecentArtworksRowProps) {
  if (artworks.length === 0) {
    return (
      <View className="mb-5 px-5">
        <Text variant="subtitle" className="mb-2">
          Vistas recientemente
        </Text>
        <View className="gap-2 rounded-[14px] border border-border bg-surface px-4 py-4 dark:border-border-dark dark:bg-surface-dark">
          <Text muted>
            Todavía no abriste ninguna obra. Empezá por la colección.
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
            hitSlop={8}
            onPress={() => router.push("/(app)/(tabs)/collection")}
            accessibilityRole="button"
            accessibilityLabel="Ir a Colección"
          >
            <TextLink>Ir a Colección</TextLink>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-5">
      <Text variant="subtitle" className="mb-3 px-5">
        Vistas recientemente
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2.5 px-5"
        decelerationRate="fast"
        nestedScrollEnabled
      >
        {artworks.map((artwork) => {
          const imageUrl =
            artwork.image_url?.trim() ||
            resolveArtworkImageUrl(artwork) ||
            null;

          return (
            <Pressable
              key={artwork.id}
              onPress={() => router.push(`/(app)/artwork/${artwork.id}`)}
              accessibilityRole="button"
              accessibilityLabel={artwork.title}
              className="overflow-hidden rounded-[14px] bg-border dark:bg-border-dark"
              style={styles.card}
            >
              {imageUrl ? (
                <Image
                  key={imageUrl}
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : null}
              <View className="absolute bottom-0 left-0 right-0 bg-scrim/55 p-2">
                <Text
                  onMedia
                  numberOfLines={2}
                  className="text-[11px] font-semibold"
                >
                  {artwork.title || "Sin título"}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
