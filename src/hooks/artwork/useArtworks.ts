import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchArtworkById, fetchArtworksPage } from "@/lib/api/artworks";
import type { ArtworkFilters } from "@/lib/api/types";
import { toApiFilters } from "@/lib/artwork";

export function useArtworks(filters: ArtworkFilters) {
  const apiFilters = useMemo(
    () => toApiFilters(filters),
    [
      filters.q,
      filters.artist,
      filters.classification,
      filters.publicDomainOnly,
    ],
  );

  return useInfiniteQuery({
    queryKey: ["artworks", apiFilters],
    queryFn: ({ pageParam, signal }) =>
      fetchArtworksPage(pageParam, apiFilters, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });
}

export function useArtwork(id: number) {
  return useQuery({
    queryKey: ["artwork", id],
    queryFn: ({ signal }) => fetchArtworkById(id, signal),
    enabled: Number.isFinite(id) && id > 0,
  });
}
