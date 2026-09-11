import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Text as RNText,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, type Href } from "expo-router";
import { Button, Input, Screen, Text } from "@/ui";
import { hexToRgba } from "@/theme/color";
import { onMediaAlpha, scrimAlpha } from "@/theme/colors";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { loginSchema, type LoginFormValues } from "@/lib/auth";
import { toUserMessage } from "@/lib/api/errors";
import { consumePendingHref } from "@/lib/navigation/pendingHref";
import { useOnboarding } from "@/providers/OnboardingProvider";

/** Cleveland Open Access (CC0) — Nathaniel Hurd */
const HERO_IMAGE_URL =
  "https://openaccess-cdn.clevelandart.org/1915.534/1915.534_web.jpg";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.52);
const BLEND_OVERLAP = Math.round(HERO_HEIGHT * 0.42);

const DEMO_EMAIL = "demo@tenpo.com";
const DEMO_PASSWORD = "tenpo123";

export default function LoginScreen() {
  const { login } = useAuth();
  const { isDone: onboardingDone } = useOnboarding();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInput>(null);
  const focusedFieldRef = useRef<"email" | "password" | null>(null);
  const keyboardOpenRef = useRef(false);
  const keyboardInsetRef = useRef(0);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    },
  });

  const scrollToForm = () => {
    // Solo si el usuario abrió email: scrollear con password enfocado
    // mueve el campo bajo el dedo y Android termina enfocando email.
    if (focusedFieldRef.current !== "email") {
      return;
    }
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.round(HERO_HEIGHT * 0.55),
        animated: true,
      });
    });
  };

  useEffect(() => {
    const KEYBOARD_GAP = 12;
    const INSET_EPSILON = 8;

    const applyInset = (height: number) => {
      const next = Math.max(0, height) + (height > 0 ? KEYBOARD_GAP : 0);
      if (Math.abs(next - keyboardInsetRef.current) < INSET_EPSILON) {
        return;
      }
      keyboardInsetRef.current = next;
      setKeyboardInset(next);
    };

    // iOS: hay que empujar a mano (Autofill / frame). Android: app.json
    // `softwareKeyboardLayoutMode: resize` ya achica la ventana; sumar
    // paddingBottom = el mismo “hueco gigante” del modal de filtros.
    if (Platform.OS === "ios") {
      const onFrame = (event: {
        endCoordinates: { height: number; screenY: number };
      }) => {
        const height = Math.max(0, SCREEN_HEIGHT - event.endCoordinates.screenY);

        if (height <= 0) {
          keyboardOpenRef.current = false;
          setKeyboardOpen(false);
          applyInset(0);
          return;
        }

        if (!keyboardOpenRef.current) {
          keyboardOpenRef.current = true;
          setKeyboardOpen(true);
          applyInset(height);
          setTimeout(scrollToForm, 50);
          return;
        }

        // Solo crecer: Autofill de password suele sumar altura; achicar provoca saltos.
        if (height + KEYBOARD_GAP > keyboardInsetRef.current + INSET_EPSILON) {
          applyInset(height);
        }
      };

      const frameSub = Keyboard.addListener("keyboardWillChangeFrame", onFrame);
      return () => frameSub.remove();
    }

    const onAndroidShow = () => {
      if (keyboardOpenRef.current) {
        return;
      }
      keyboardOpenRef.current = true;
      setKeyboardOpen(true);
      setTimeout(scrollToForm, 80);
    };

    const onAndroidHide = () => {
      keyboardOpenRef.current = false;
      setKeyboardOpen(false);
    };

    const showSub = Keyboard.addListener("keyboardDidShow", onAndroidShow);
    const hideSub = Keyboard.addListener("keyboardDidHide", onAndroidHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      const pending = consumePendingHref();
      if (pending) {
        router.replace(pending as Href, { withAnchor: true });
        return;
      }
      router.replace(onboardingDone ? "/(app)/(tabs)" : "/(app)/onboarding");
    } catch (error) {
      setFormError(toUserMessage(error));
    }
  });

  const bg = colors.bg;

  return (
    <Screen
      edges={
        keyboardInset > 0 ? ["left", "right"] : ["left", "right", "bottom"]
      }
      style={{ backgroundColor: bg }}
    >
      <View className="flex-1" style={{ paddingBottom: keyboardInset }}>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName={keyboardOpen ? undefined : "grow"}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          automaticallyAdjustKeyboardInsets={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            className="w-full bg-login-hero"
            style={{ height: HERO_HEIGHT }}
          >
            <Image
              source={{ uri: HERO_IMAGE_URL }}
              className="absolute inset-0 h-full w-full"
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <LinearGradient
              pointerEvents="none"
              colors={[
                scrimAlpha(0.45),
                scrimAlpha(0.12),
                hexToRgba(bg, 0.2),
                hexToRgba(bg, 0.75),
                bg,
              ]}
              locations={[0, 0.28, 0.55, 0.78, 1]}
              style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <View
              className="gap-1.5 px-5"
              style={{ paddingTop: Math.max(insets.top, 16) + 8 }}
            >
              <RNText className="text-[32px] font-bold tracking-tight text-on-media">
                Tenpo Gallery
              </RNText>
              <RNText
                className="max-w-[300px] text-[15px] leading-[21px]"
                style={{ color: onMediaAlpha(0.88) }}
              >
                Colección abierta del Cleveland Museum of Art.
              </RNText>
            </View>
          </View>

          <LinearGradient
            colors={[
              hexToRgba(bg, 0),
              hexToRgba(bg, 0.55),
              hexToRgba(bg, 0.92),
              bg,
            ]}
            locations={[0, 0.22, 0.5, 0.72]}
            style={{
              marginTop: -BLEND_OVERLAP,
              paddingTop: BLEND_OVERLAP * 0.72,
            }}
          >
            <View className="gap-3 px-5 pb-4">
              <Text variant="subtitle" className="mb-1">
                Iniciar sesión
              </Text>
              <Text muted className="mb-1">
                Demo precompletada: {DEMO_EMAIL} / {DEMO_PASSWORD}. Cualquier
                email válido y password ≥ 6 también sirven.
              </Text>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="vos@email.com"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType="email-address"
                    // Para login iOS: username + password reduce thrash de la barra Autofill.
                    textContentType="username"
                    autoComplete="username"
                    value={value}
                    onBlur={onBlur}
                    onTouchStart={() => {
                      focusedFieldRef.current = "email";
                    }}
                    onFocus={() => {
                      focusedFieldRef.current = "email";
                    }}
                    onChangeText={onChange}
                    error={errors.email?.message}
                    editable={!isSubmitting}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={passwordRef}
                    label="Contraseña"
                    placeholder="••••••••"
                    secureTextEntry
                    textContentType="password"
                    autoComplete="password"
                    value={value}
                    onBlur={onBlur}
                    onTouchStart={() => {
                      focusedFieldRef.current = "password";
                    }}
                    onFocus={() => {
                      focusedFieldRef.current = "password";
                    }}
                    onChangeText={onChange}
                    error={errors.password?.message}
                    editable={!isSubmitting}
                    returnKeyType="go"
                    onSubmitEditing={onSubmit}
                  />
                )}
              />
            </View>
          </LinearGradient>
        </ScrollView>

        <View className="gap-2 border-t border-border px-5 pb-2 pt-1.5 dark:border-border-dark bg-bg dark:bg-bg-dark">
          {formError ? (
            <RNText
              className="text-xs leading-4 text-danger dark:text-danger-dark"
              numberOfLines={2}
            >
              {formError}
            </RNText>
          ) : null}
          <Button
            title="Iniciar sesión"
            loading={isSubmitting}
            onPress={onSubmit}
            size="lg"
          />
        </View>
      </View>
    </Screen>
  );
}
