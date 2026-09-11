import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ArtworkSummary } from "@/lib/api/types";
import {
  cacheFavoriteImage,
  deleteCachedFavoriteImage,
  deleteCachedFavoriteImages,
} from "@/lib/favorites/imageCache";
import { loadFavorites, saveFavorites } from "@/lib/favorites/storage";

type FavoritesContextValue = {
  favorites: ArtworkSummary[];
  isHydrating: boolean;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (artwork: ArtworkSummary) => Promise<void>;
  removeFavorites: (ids: number[]) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ArtworkSummary[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    loadFavorites()
      .then(setFavorites)
      .finally(() => setIsHydrating(false));
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.some((item) => item.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(async (artwork: ArtworkSummary) => {
    let removed = false;

    setFavorites((current) => {
      const exists = current.some((item) => item.id === artwork.id);
      if (exists) {
        removed = true;
        const next = current.filter((item) => item.id !== artwork.id);
        saveFavorites(next);
        return next;
      }

      const next = [artwork, ...current];
      saveFavorites(next);
      return next;
    });

    if (removed) {
      deleteCachedFavoriteImage(artwork.id);
      return;
    }

    const cachedUri = await cacheFavoriteImage(artwork.id, artwork.image_url);
    if (!cachedUri) {
      return;
    }

    setFavorites((current) => {
      const next = current.map((item) =>
        item.id === artwork.id
          ? { ...item, cached_image_uri: cachedUri }
          : item,
      );
      saveFavorites(next);
      return next;
    });
  }, []);

  const removeFavorites = useCallback(async (ids: number[]) => {
    if (ids.length === 0) {
      return;
    }
    const idSet = new Set(ids);
    setFavorites((current) => {
      const next = current.filter((item) => !idSet.has(item.id));
      saveFavorites(next);
      return next;
    });
    deleteCachedFavoriteImages(ids);
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      isHydrating,
      isFavorite,
      toggleFavorite,
      removeFavorites,
    }),
    [favorites, isHydrating, isFavorite, toggleFavorite, removeFavorites],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
