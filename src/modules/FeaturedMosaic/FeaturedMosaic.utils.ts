import type { ArtworkSummary } from "@/lib/api/types";

export const DEFAULT_ASPECT_RATIO = 3 / 4;
export const MIN_ASPECT = 0.55;
export const MAX_ASPECT = 1.6;

export function getArtworkAspectRatio(artwork: ArtworkSummary): number {
  const width = artwork.image_width;
  const height = artwork.image_height;
  if (width && height && height > 0 && width > 0) {
    return Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, width / height));
  }
  return DEFAULT_ASPECT_RATIO;
}

/**
 * Orden de lectura L→R: 1ª izquierda, 2ª derecha, 3ª izquierda…
 */
export function distributeColumns(artworks: ArtworkSummary[]) {
  const left: ArtworkSummary[] = [];
  const right: ArtworkSummary[] = [];

  artworks.forEach((artwork, index) => {
    if (index % 2 === 0) {
      left.push(artwork);
    } else {
      right.push(artwork);
    }
  });

  return { left, right };
}
