import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ArtworkSummary } from "@/lib/api/types";

const FAVORITES_KEY = "@tenpo/favorites";

export async function loadFavorites(): Promise<ArtworkSummary[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ArtworkSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    return [];
  }
}

export async function saveFavorites(favorites: ArtworkSummary[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}
