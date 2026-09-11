import { Platform, Share } from "react-native";
import * as Linking from "expo-linking";

export function createArtworkDeepLink(id: number): string {
  return Linking.createURL(`artwork/${id}`);
}

export async function shareArtwork(input: {
  id: number;
  title: string;
  artist?: string | null;
}): Promise<void> {
  const url = createArtworkDeepLink(input.id);
  const headline = input.title.trim() || "Obra de Tenpo Gallery";
  const artist = input.artist?.trim();
  const body = artist ? `${headline}\n${artist}` : headline;

  if (Platform.OS === "ios") {
    await Share.share({
      title: headline,
      message: body,
      url,
    });
    return;
  }

  await Share.share({
    title: headline,
    message: `${body}\n${url}`,
  });
}

export async function shareFavorites(
  artworks: { id: number; title: string; artist_display?: string | null }[],
  options?: { asSelection?: boolean },
): Promise<void> {
  if (artworks.length === 0) {
    return;
  }

  const asSelection = Boolean(options?.asSelection);
  const headline =
    artworks.length === 1
      ? asSelection
        ? "1 obra seleccionada de Tenpo Gallery"
        : "1 obra de mis favoritos en Tenpo Gallery"
      : asSelection
        ? `${artworks.length} obras seleccionadas de Tenpo Gallery`
        : `${artworks.length} obras de mis favoritos en Tenpo Gallery`;

  const lines = artworks.slice(0, 12).map((artwork, index) => {
    const title = artwork.title.trim() || "Sin título";
    const artist = artwork.artist_display?.trim();
    const link = createArtworkDeepLink(artwork.id);
    return `${index + 1}. ${title}${artist ? ` — ${artist}` : ""}\n${link}`;
  });

  const more =
    artworks.length > 12
      ? `\n…y ${artworks.length - 12} más en la app.`
      : "";

  const message = `${headline}\n\n${lines.join("\n\n")}${more}`;

  await Share.share({
    title: headline,
    message,
  });
}
