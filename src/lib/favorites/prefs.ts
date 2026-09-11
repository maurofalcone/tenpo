import AsyncStorage from "@react-native-async-storage/async-storage";

const SKIP_DELETE_CONFIRM_KEY = "@tenpo/favorites-skip-delete-confirm";

export async function loadSkipFavoritesDeleteConfirm(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SKIP_DELETE_CONFIRM_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

export async function saveSkipFavoritesDeleteConfirm(
  skip: boolean,
): Promise<void> {
  if (skip) {
    await AsyncStorage.setItem(SKIP_DELETE_CONFIRM_KEY, "1");
    return;
  }
  await AsyncStorage.removeItem(SKIP_DELETE_CONFIRM_KEY);
}
