import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Appearance,
  useColorScheme as useSystemColorScheme,
  View,
  type ColorSchemeName,
} from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
  loadThemePreference,
  saveThemePreference,
  type ThemePreference,
} from "@/lib/theme/storage";
import {
  getPalette,
  type ColorScheme,
  type Palette,
} from "@/theme/palette";

type ThemeContextValue = {
  preference: ThemePreference;
  scheme: ColorScheme;
  colors: Palette;
  setPreference: (preference: ThemePreference) => void;
  isHydrating: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(value: ColorSchemeName | null | undefined): ColorScheme {
  return value === "dark" ? "dark" : "light";
}

function followSystemAppearance() {
  // RN 0.82+: `null` crashea; `"unspecified"` = seguir el tema del sistema.
  Appearance.setColorScheme("unspecified");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    loadThemePreference()
      .then(setPreferenceState)
      .finally(() => setIsHydrating(false));
  }, []);

  useEffect(() => {
    if (preference === "auto") {
      followSystemAppearance();
      setColorScheme("system");
      return;
    }

    Appearance.setColorScheme(preference);
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  const systemScheme = resolveScheme(systemColorScheme);
  const scheme: ColorScheme =
    preference === "auto" ? systemScheme : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    saveThemePreference(next);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      scheme,
      colors: getPalette(scheme),
      setPreference,
      isHydrating,
    }),
    [preference, scheme, setPreference, isHydrating],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1 }} className={scheme === "dark" ? "dark" : ""}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
