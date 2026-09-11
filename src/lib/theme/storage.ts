import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = "light" | "auto" | "dark";

const THEME_PREFERENCE_KEY = "@tenpo/theme-preference";

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const raw = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (raw === "light" || raw === "dark" || raw === "auto") {
      return raw;
    }
  } catch {
    // ignore
  }
  return "auto";
}

export async function saveThemePreference(
  preference: ThemePreference,
): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
}
