import type { ArtworkSummary } from "@/lib/api/types";

/** Prefiere el summary vivo de la API sobre el snapshot cacheado del día. */
export function pickFreshDailyArtwork(
  cached: ArtworkSummary,
  candidates: ArtworkSummary[],
): ArtworkSummary {
  return candidates.find((item) => item.id === cached.id) ?? cached;
}
