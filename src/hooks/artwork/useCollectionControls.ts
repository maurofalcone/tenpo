import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ARTWORK_SORT_OPTIONS,
  emptyFilters,
  hasFilters,
  loadCollectionViewMode,
  saveCollectionViewMode,
  type ArtworkSortId,
  type CollectionViewMode,
} from "@/lib/artwork";
import type { ArtworkFilters } from "@/lib/api/types";

export type CollectionFilterChip = {
  key: string;
  label: string;
  clear: () => void;
};

type FilterChipKey = keyof ArtworkFilters;

function buildFilterChips(
  filters: ArtworkFilters,
  clearKey: (key: FilterChipKey) => void,
): CollectionFilterChip[] {
  const chip = (
    key: FilterChipKey,
    label: string | false | null | undefined,
    id: string = key,
  ): CollectionFilterChip | null =>
    label ? { key: id, label, clear: () => clearKey(key) } : null;

  const q = filters.q?.trim();
  const artist = filters.artist?.trim();

  return [
    chip("q", q ? `“${q}”` : null),
    chip("artist", artist ? `Artista: ${artist}` : null),
    chip("classification", filters.classification),
    chip(
      "publicDomainOnly",
      filters.publicDomainOnly ? "Dominio público" : null,
      "public",
    ),
    chip(
      "knownArtistOnly",
      filters.knownArtistOnly ? "Con artista" : null,
      "knownArtist",
    ),
  ].filter((item): item is CollectionFilterChip => item != null);
}

/**
 * Controles de colección: filtros, orden, vista lista/cards y menús.
 */
export function useCollectionControls() {
  const [filters, setFilters] = useState<ArtworkFilters>(emptyFilters());
  const [sort, setSort] = useState<ArtworkSortId>("default");
  const [viewMode, setViewMode] = useState<CollectionViewMode>("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  useEffect(() => {
    loadCollectionViewMode().then(setViewMode);
  }, []);

  const clearFilterKey = useCallback((key: FilterChipKey) => {
    setFilters((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const activeChips = useMemo(
    () => buildFilterChips(filters, clearFilterKey),
    [filters, clearFilterKey],
  );

  const filtersActive = hasFilters(filters);
  const sortActive = sort !== "default";

  const selectedSortLabel = useMemo(
    () =>
      ARTWORK_SORT_OPTIONS.find((option) => option.id === sort)?.label ??
      "Por defecto",
    [sort],
  );

  const closeMenus = useCallback(() => {
    setSortMenuOpen(false);
    setViewMenuOpen(false);
  }, []);

  const clearFilters = useCallback(() => setFilters(emptyFilters()), []);

  /** @returns true si el valor cambió (para animar en la screen). */
  const selectSort = useCallback(
    (next: ArtworkSortId) => {
      closeMenus();
      let changed = false;
      setSort((prev) => {
        if (prev === next) {
          return prev;
        }
        changed = true;
        return next;
      });
      return changed;
    },
    [closeMenus],
  );

  /** @returns true si el valor cambió (para animar en la screen). */
  const selectViewMode = useCallback(
    (next: CollectionViewMode) => {
      closeMenus();
      let changed = false;
      setViewMode((prev) => {
        if (prev === next) {
          return prev;
        }
        changed = true;
        return next;
      });
      if (changed) {
        saveCollectionViewMode(next);
      }
      return changed;
    },
    [closeMenus],
  );

  const openFilters = useCallback(() => {
    closeMenus();
    setFiltersOpen(true);
  }, [closeMenus]);

  const toggleSortMenu = useCallback(() => {
    setViewMenuOpen(false);
    setSortMenuOpen((open) => !open);
  }, []);

  const toggleViewMenu = useCallback(() => {
    setSortMenuOpen(false);
    setViewMenuOpen((open) => !open);
  }, []);

  return {
    filters,
    setFilters,
    filtersOpen,
    setFiltersOpen,
    openFilters,
    clearFilters,
    filtersActive,
    activeChips,
    sort,
    sortActive,
    selectedSortLabel,
    sortMenuOpen,
    toggleSortMenu,
    selectSort,
    viewMode,
    viewMenuOpen,
    toggleViewMenu,
    selectViewMode,
    closeMenus,
  };
}
