import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ArtworkFilters } from "@/lib/api/types";
import { hasFilters, normalizeFilters } from "./filters";

const HISTORY_KEY = "@tenpo/filter-history";
const MAX_HISTORY = 8;

export type FilterHistoryEntry = {
  id: string;
  label: string;
  filters: ArtworkFilters;
  savedAt: number;
};

function entryId(filters: ArtworkFilters) {
  const n = normalizeFilters(filters);
  return [
    n.q ?? "",
    n.artist ?? "",
    n.classification ?? "",
    n.publicDomainOnly ? "1" : "0",
    n.knownArtistOnly ? "1" : "0",
  ].join("|");
}

export function labelForFilters(filters: ArtworkFilters): string {
  const n = normalizeFilters(filters);
  const parts: string[] = [];
  if (n.q) {
    parts.push(`“${n.q}”`);
  }
  if (n.artist) {
    parts.push(n.artist);
  }
  if (n.classification) {
    parts.push(n.classification);
  }
  if (n.publicDomainOnly) {
    parts.push("Dominio público");
  }
  if (n.knownArtistOnly) {
    parts.push("Con artista");
  }
  return parts.join(" · ") || "Filtros";
}

export async function loadFilterHistory(): Promise<FilterHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as FilterHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

export async function pushFilterHistory(
  filters: ArtworkFilters,
): Promise<FilterHistoryEntry[]> {
  if (!hasFilters(filters)) {
    return loadFilterHistory();
  }

  const normalized = normalizeFilters(filters);
  const id = entryId(normalized);
  const current = await loadFilterHistory();
  const next: FilterHistoryEntry[] = [
    {
      id,
      label: labelForFilters(normalized),
      filters: normalized,
      savedAt: Date.now(),
    },
    ...current.filter((item) => item.id !== id),
  ].slice(0, MAX_HISTORY);

  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}
