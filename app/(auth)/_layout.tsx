import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

export default function AuthLayout() {
  const { isAuthenticated, isHydrating } = useAuth();

  if (!isHydrating && isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
