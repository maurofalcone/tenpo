import type { ArtworkSummary } from "@/lib/api/types";

export type ArtworkSortId =
  | "default"
  | "title-asc"
  | "title-desc"
  | "artist-asc";

export type ArtworkSortOption = {
  id: ArtworkSortId;
  label: string;
};

export const ARTWORK_SORT_OPTIONS: ArtworkSortOption[] = [
  { id: "default", label: "Por defecto" },
  { id: "title-asc", label: "Título A–Z" },
  { id: "title-desc", label: "Título Z–A" },
  { id: "artist-asc", label: "Artista" },
];

function compareText(a: string, b: string) {
  return a.localeCompare(b, "es", { sensitivity: "base", numeric: true });
}

/** Ordena en FE el listado ya cargado (páginas actuales). */
export function sortArtworks(
  artworks: ArtworkSummary[],
  sort: ArtworkSortId,
): ArtworkSummary[] {
  if (sort === "default") {
    return artworks;
  }

  const next = [...artworks];

  if (sort === "title-asc") {
    next.sort((a, b) => compareText(a.title, b.title));
    return next;
  }

  if (sort === "title-desc") {
    next.sort((a, b) => compareText(b.title, a.title));
    return next;
  }

  next.sort((a, b) =>
    compareText(a.artist_display || "~~~~", b.artist_display || "~~~~"),
  );
  return next;
}
