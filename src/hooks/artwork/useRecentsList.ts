import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { ArtworkSummary } from "@/lib/api/types";
import { loadRecents } from "@/lib/artwork";

export function useRecentsList() {
  const [recents, setRecents] = useState<ArtworkSummary[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setIsHydrating(true);
      loadRecents().then((items) => {
        if (!cancelled) {
          setRecents(items);
          setIsHydrating(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return { recents, isHydrating };
}
