import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IconName } from "@/ui";

export type CollectionViewMode = "list" | "cards";

export const COLLECTION_VIEW_OPTIONS: {
  id: CollectionViewMode;
  label: string;
  icon: IconName;
}[] = [
  { id: "list", label: "Lista", icon: "list" },
  { id: "cards", label: "Cards", icon: "grid" },
];

const VIEW_MODE_KEY = "@tenpo/collection-view-mode";

export async function loadCollectionViewMode(): Promise<CollectionViewMode> {
  try {
    const raw = await AsyncStorage.getItem(VIEW_MODE_KEY);
    if (raw === "list" || raw === "cards") {
      return raw;
    }
  } catch {
    // ignore
  }
  return "list";
}

export async function saveCollectionViewMode(
  mode: CollectionViewMode,
): Promise<void> {
  await AsyncStorage.setItem(VIEW_MODE_KEY, mode);
}
