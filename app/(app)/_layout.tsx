import { Redirect, Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboarding } from "@/providers/OnboardingProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { setPendingHref } from "@/lib/navigation/pendingHref";
import { Screen, Spinner } from "@/ui";

/** Deep links a /artwork/:id cargan (tabs) debajo para poder volver. */
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function AppLayout() {
  const { isAuthenticated, isHydrating } = useAuth();
  const { isHydrating: onboardingHydrating, isDone: onboardingDone } =
    useOnboarding();
  const { colors } = useTheme();
  const pathname = usePathname();

  if (isHydrating || onboardingHydrating) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" color="accent" />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    const artworkMatch = pathname.match(/^\/artwork\/(\d+)/);
    if (artworkMatch) {
      setPendingHref(`/(app)/artwork/${artworkMatch[1]}`);
    }
    return <Redirect href="/(auth)/login" />;
  }

  const onOnboarding = pathname.includes("onboarding");
  const allowWithoutOnboarding =
    onOnboarding ||
    pathname.includes("artwork") ||
    pathname.includes("compare");
  if (!onboardingDone && !allowWithoutOnboarding) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="compare"
        options={
          {
            headerShown: true,
            title: "",
            presentation: "card",
            headerBackVisible: false,
            headerLeftBackgroundVisible: false,
            headerRightBackgroundVisible: false,
          } as object
        }
      />
      <Stack.Screen
        name="artwork/[id]"
        // Cast: props de header background aún no tipados en esta versión.
        options={
          {
            headerShown: true,
            title: "",
            presentation: "card",
            headerBackVisible: false,
            headerLeftBackgroundVisible: false,
            headerRightBackgroundVisible: false,
          } as object
        }
      />
    </Stack>
  );
}
