import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Icon,
  Screen,
  Spinner,
  Text,
  type IconName,
} from "@/ui";
import { useOnboarding } from "@/providers/OnboardingProvider";

const SLIDES: {
  icon: IconName;
  title: string;
  description: string;
}[] = [
  {
    icon: "heart-outline",
    title: "Favoritos a tu ritmo",
    description:
      "Tocá el corazón para guardar. En Favoritos podés compartir tu selección e imprimir cada obra en PDF. Mantené presionada una para seleccionar, comparar o eliminar.",
  },
  {
    icon: "images-outline",
    title: "Explorá la colección",
    description:
      "Filtrá por artista o clasificación, alterná lista o cards, y abrí cualquier obra para verla en detalle.",
  },
  {
    icon: "color-palette-outline",
    title: "Tu apariencia",
    description:
      "En Perfil elegí tema Claro, Auto u Oscuro. Auto sigue el modo del sistema.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { isHydrating, isDone, complete } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(windowWidth);
  const [pageHeight, setPageHeight] = useState(0);

  if (isHydrating) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
        </View>
      </Screen>
    );
  }

  if (isDone) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const isLast = index >= SLIDES.length - 1;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const width = pageWidth || windowWidth;
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(next, SLIDES.length - 1)));
  };

  const goNext = async () => {
    if (!isLast) {
      const width = pageWidth || windowWidth;
      scrollRef.current?.scrollTo({
        x: (index + 1) * width,
        animated: true,
      });
      setIndex((value) => value + 1);
      return;
    }
    await finishOnboarding();
  };

  const finishOnboarding = async () => {
    await complete();
    router.replace("/(app)/(tabs)");
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <View
        className="flex-1 pt-2"
        style={{
          paddingBottom: Math.max(insets.bottom, 16) + 8,
        }}
      >
        <View className="min-h-9 flex-row items-center justify-end px-5 pb-1">
          <View className="flex-1" />
          <Pressable
            onPress={finishOnboarding}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Omitir onboarding"
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text muted variant="label">
              Omitir
            </Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          decelerationRate="fast"
          className="flex-1"
          onLayout={(event) => {
            const { width: nextWidth, height: nextHeight } =
              event.nativeEvent.layout;
            if (nextWidth > 0 && nextWidth !== pageWidth) {
              setPageWidth(nextWidth);
            }
            if (nextHeight > 0 && nextHeight !== pageHeight) {
              setPageHeight(nextHeight);
            }
          }}
        >
          {SLIDES.map((slide) => (
            <View
              key={slide.title}
              className="items-center justify-center"
              style={{
                width: pageWidth,
                height: pageHeight || undefined,
              }}
            >
              <View className="w-full items-center gap-5 px-8">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-surface dark:bg-surface-dark">
                  <Icon name={slide.icon} size={36} color="accent" />
                </View>
                <Text variant="title" className="text-center">
                  {slide.title}
                </Text>
                <Text muted className="text-center leading-6">
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="gap-5 px-6">
          <View className="flex-row items-center justify-center gap-2">
            {SLIDES.map((slide, slideIndex) => (
              <View
                key={slide.title}
                className={`h-2 rounded-full ${
                  slideIndex === index
                    ? "w-[18px] bg-accent dark:bg-accent-dark"
                    : "w-2 bg-border dark:bg-border-dark"
                }`}
              />
            ))}
          </View>

          <Button
            title={isLast ? "Empezar" : "Siguiente"}
            onPress={goNext}
          />
        </View>
      </View>
    </Screen>
  );
}
