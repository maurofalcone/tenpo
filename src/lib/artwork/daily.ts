import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ArtworkSummary } from "@/lib/api/types";

const DAILY_KEY = "@tenpo/daily-artwork";

export type DailyArtworkCache = {
  dateKey: string;
  artwork: ArtworkSummary;
};

export function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function pickDailyIndex(dateKey: string, length: number) {
  if (length <= 0) {
    return 0;
  }
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

export async function loadDailyArtwork(): Promise<DailyArtworkCache | null> {
  const raw = await AsyncStorage.getItem(DAILY_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as DailyArtworkCache;
    if (!parsed?.dateKey || !parsed?.artwork?.id) {
      return null;
    }
    return parsed;
  } catch {
    await AsyncStorage.removeItem(DAILY_KEY);
    return null;
  }
}

export async function saveDailyArtwork(
  cache: DailyArtworkCache,
): Promise<void> {
  await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(cache));
}
