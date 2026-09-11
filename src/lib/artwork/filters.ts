import type { ArtworkSummary } from "@/lib/api/types";

export type { ArtworkFilters } from "@/lib/api/types";

/** Tipos comunes del Appendix C de Cleveland Open Access API. */
export const CLASSIFICATION_OPTIONS = [
  "Arms and Armor",
  "Calligraphy",
  "Ceramic",
  "Coins",
  "Drawing",
  "Embroidery",
  "Enamel",
  "Furniture and woodwork",
  "Glass",
  "Illumination",
  "Ivory",
  "Jade",
  "Jewelry",
  "Manuscript",
  "Metalwork",
  "Miniature",
  "Mixed Media",
  "Musical Instrument",
  "Painting",
  "Photograph",
  "Print",
  "Relief",
  "Sculpture",
  "Tapestry",
  "Textile",
  "Vessels",
  "Wood",
  "Woodblock",
] as const;

export type ClassificationOption = (typeof CLASSIFICATION_OPTIONS)[number];

export function emptyFilters() {
  return {
    q: "",
    artist: "",
    classification: undefined as string | undefined,
    publicDomainOnly: false,
    knownArtistOnly: false,
  };
}

export function normalizeFilters(filters: {
  q?: string;
  artist?: string;
  classification?: string;
  publicDomainOnly?: boolean;
  knownArtistOnly?: boolean;
}) {
  return {
    q: filters.q?.trim() || undefined,
    artist: filters.artist?.trim() || undefined,
    classification: filters.classification || undefined,
    publicDomainOnly: filters.publicDomainOnly || undefined,
    knownArtistOnly: filters.knownArtistOnly || undefined,
  };
}

/** Params que van a la API (sin filtros solo de FE). */
export function toApiFilters(filters: {
  q?: string;
  artist?: string;
  classification?: string;
  publicDomainOnly?: boolean;
  knownArtistOnly?: boolean;
}) {
  const normalized = normalizeFilters(filters);
  return {
    q: normalized.q,
    artist: normalized.artist,
    classification: normalized.classification,
    publicDomainOnly: normalized.publicDomainOnly,
  };
}

export function areFiltersEqual(
  a: {
    q?: string;
    artist?: string;
    classification?: string;
    publicDomainOnly?: boolean;
    knownArtistOnly?: boolean;
  },
  b: {
    q?: string;
    artist?: string;
    classification?: string;
    publicDomainOnly?: boolean;
    knownArtistOnly?: boolean;
  },
) {
  const left = normalizeFilters(a);
  const right = normalizeFilters(b);
  return (
    left.q === right.q &&
    left.artist === right.artist &&
    left.classification === right.classification &&
    left.publicDomainOnly === right.publicDomainOnly &&
    left.knownArtistOnly === right.knownArtistOnly
  );
}

export function hasFilters(filters: {
  q?: string;
  artist?: string;
  classification?: string;
  publicDomainOnly?: boolean;
  knownArtistOnly?: boolean;
}) {
  return Boolean(
    filters.q?.trim() ||
      filters.artist?.trim() ||
      filters.classification ||
      filters.publicDomainOnly ||
      filters.knownArtistOnly,
  );
}

export function hasKnownArtist(artwork: ArtworkSummary) {
  const artist = artwork.artist_display?.trim();
  if (!artist) {
    return false;
  }
  const lower = artist.toLowerCase();
  return !(
    lower === "unknown" ||
    lower === "anonymous" ||
    lower === "artista desconocido" ||
    lower.includes("unknown artist") ||
    lower.includes("artist unknown")
  );
}
