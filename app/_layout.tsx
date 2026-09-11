import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppErrorBoundary } from "@/providers/AppErrorBoundary";
import { AuthProvider } from "@/providers/AuthProvider";
import { FavoritesProvider } from "@/providers/FavoritesProvider";
import { OnboardingProvider } from "@/providers/OnboardingProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";

function RootNavigator() {
  const { scheme } = useTheme();

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <OnboardingProvider>
                <FavoritesProvider>
                  <RootNavigator />
                </FavoritesProvider>
              </OnboardingProvider>
            </AuthProvider>
          </QueryProvider>
        </AppErrorBoundary>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
