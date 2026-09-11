import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ArtworkSummary } from "@/lib/api/types";

const RECENTS_KEY = "@tenpo/recents";
const MAX_RECENTS = 10;

export async function loadRecents(): Promise<ArtworkSummary[]> {
  const raw = await AsyncStorage.getItem(RECENTS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as ArtworkSummary[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    if (parsed.length <= MAX_RECENTS) {
      return parsed;
    }
    // Recortar viejas y persistir para no dejar basura en storage.
    const trimmed = parsed.slice(0, MAX_RECENTS);
    await saveRecents(trimmed);
    return trimmed;
  } catch {
    await AsyncStorage.removeItem(RECENTS_KEY);
    return [];
  }
}

export async function saveRecents(recents: ArtworkSummary[]): Promise<void> {
  await AsyncStorage.setItem(
    RECENTS_KEY,
    JSON.stringify(recents.slice(0, MAX_RECENTS)),
  );
}

export async function pushRecent(
  artwork: ArtworkSummary,
): Promise<ArtworkSummary[]> {
  const current = await loadRecents();
  const next = [
    artwork,
    ...current.filter((item) => item.id !== artwork.id),
  ].slice(0, MAX_RECENTS);
  await saveRecents(next);
  return next;
}
