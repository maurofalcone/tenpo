import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useArtworks } from "./useArtworks";
import { hasKnownArtist } from "@/lib/artwork";
import type { ArtworkFilters, ArtworkSummary } from "@/lib/api/types";

export function useCollectionFeed(filters: ArtworkFilters) {
  const [pullRefreshing, setPullRefreshing] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArtworks(filters);

  useFocusEffect(
    useCallback(() => {
      setPullRefreshing(false);
    }, []),
  );

  const artworks = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.data) ?? [];
    const seen = new Set<number>();
    const unique = items.filter((item: ArtworkSummary) => {
      if (!item?.id || seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
    if (!filters.knownArtistOnly) {
      return unique;
    }
    return unique.filter(hasKnownArtist);
  }, [data, filters.knownArtistOnly]);

  const total = data?.pages[0]?.pagination.total;

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const onPullRefresh = useCallback(async () => {
    setPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setPullRefreshing(false);
    }
  }, [refetch]);

  return {
    artworks,
    total,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    pullRefreshing,
    onEndReached,
    onPullRefresh,
  };
}
