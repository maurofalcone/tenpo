import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button, Card, Screen, ScreenBody, Text } from "@/ui";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboarding } from "@/providers/OnboardingProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { toUserMessage } from "@/lib/api/errors";
import {
  loadSkipFavoritesDeleteConfirm,
  saveSkipFavoritesDeleteConfirm,
} from "@/lib/favorites/prefs";
import type { ThemePreference } from "@/lib/theme/storage";

const THEME_OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: "light", label: "Claro" },
  { id: "auto", label: "Auto" },
  { id: "dark", label: "Oscuro" },
];

export default function ProfileScreen() {
  const { session, logout } = useAuth();
  const { reset: resetOnboarding } = useOnboarding();
  const { preference, setPreference, scheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);
  const [resettingDeleteConfirm, setResettingDeleteConfirm] = useState(false);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSkipFavoritesDeleteConfirm().then((skip) => {
        if (active) {
          setSkipDeleteConfirm(skip);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const onLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onResetOnboarding = async () => {
    setError(null);
    setResettingOnboarding(true);
    try {
      await resetOnboarding();
      router.replace("/(app)/onboarding");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setResettingOnboarding(false);
    }
  };

  const onRestoreDeleteConfirm = async () => {
    setError(null);
    setResettingDeleteConfirm(true);
    try {
      await saveSkipFavoritesDeleteConfirm(false);
      setSkipDeleteConfirm(false);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setResettingDeleteConfirm(false);
    }
  };

  return (
    <Screen edges={["left", "right"]}>
      <ScreenBody padded={false} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow justify-between gap-5 px-5 pt-4 pb-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5">
            <View className="gap-2">
              <Text variant="title">Perfil</Text>
              <Text muted>Tu sesión local en este dispositivo.</Text>
              <Text muted variant="caption">
                Los textos de las obras (títulos, descripciones, etc.) vienen en
                inglés: la API del Cleveland Museum no ofrece español.
              </Text>
            </View>

            <Card className="gap-2">
              <Text variant="label">Email</Text>
              <Text>{session?.email ?? "—"}</Text>
              <View className="mt-3 self-start rounded-full bg-success/15 px-3 py-1">
                <Text
                  variant="caption"
                  className="text-success dark:text-success-dark"
                >
                  Sesión activa
                </Text>
              </View>
            </Card>

            <Card className="gap-3">
              <View className="gap-1">
                <Text variant="label">Apariencia</Text>
                <Text muted variant="caption">
                  {preference === "auto"
                    ? `Auto (ahora ${scheme === "dark" ? "oscuro" : "claro"})`
                    : preference === "dark"
                      ? "Oscuro fijo"
                      : "Claro fijo"}
                </Text>
              </View>

              <View className="flex-row rounded-xl border border-border bg-bg p-1 dark:border-border-dark dark:bg-bg-dark">
                {THEME_OPTIONS.map((option) => {
                  const selected = preference === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setPreference(option.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      className={`flex-1 items-center rounded-lg px-2 py-2.5 ${
                        selected
                          ? "bg-surface dark:bg-surface-dark"
                          : "bg-transparent"
                      }`}
                    >
                      <Text
                        variant="label"
                        className={
                          selected
                            ? "font-semibold text-text dark:text-text-dark"
                            : "font-medium text-muted dark:text-muted-dark"
                        }
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card className="gap-3">
              <View className="gap-1">
                <Text variant="label">Favoritos</Text>
                <Text muted variant="caption">
                  {skipDeleteConfirm
                    ? 'Marcaste "No volver a mostrar" al eliminar. Podés reactivar la confirmación.'
                    : "La confirmación al eliminar favoritos está activa."}
                </Text>
              </View>
              <Button
                title="Volver a mostrar confirmación"
                variant="ghost"
                leftIcon="alert-circle-outline"
                loading={resettingDeleteConfirm}
                disabled={!skipDeleteConfirm}
                onPress={onRestoreDeleteConfirm}
              />
            </Card>

            <Card className="gap-3">
              <View className="gap-1">
                <Text variant="label">Demo</Text>
                <Text muted variant="caption">
                  Volvé a ver las slides de bienvenida sin cerrar sesión.
                </Text>
              </View>
              <Button
                title="Ver onboarding de nuevo"
                variant="ghost"
                leftIcon="refresh-outline"
                loading={resettingOnboarding}
                onPress={onResetOnboarding}
              />
            </Card>
          </View>

          <View className="gap-2">
            {error ? (
              <Text danger variant="caption">
                {error}
              </Text>
            ) : null}
            <Button
              title="Cerrar sesión"
              variant="danger"
              loading={loading}
              onPress={onLogout}
              leftIcon="log-out-outline"
            />
          </View>
        </ScrollView>
      </ScreenBody>
    </Screen>
  );
}
