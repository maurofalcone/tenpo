import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboarding } from "@/providers/OnboardingProvider";
import { Screen, Spinner } from "@/ui";

export default function Index() {
  const { isAuthenticated, isHydrating } = useAuth();
  const { isHydrating: onboardingHydrating, isDone: onboardingDone } =
    useOnboarding();

  if (isHydrating || onboardingHydrating) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" color="accent" />
        </View>
      </Screen>
    );
  }

  if (isAuthenticated) {
    if (!onboardingDone) {
      return <Redirect href="/(app)/onboarding" />;
    }
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
