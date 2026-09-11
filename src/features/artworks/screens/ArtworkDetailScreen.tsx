import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  ArtworkDetailSkeleton,
  EmptyState,
  ErrorView,
  ExpandImageButton,
  HtmlContent,
  Icon,
  Screen,
  Text,
  TextLink,
  minimalStackHeaderOptions,
} from "@/ui";
import { FavoriteButton } from "@/features/favorites";
import { resolveArtworkImageUrl } from "@/lib/api/artworks";
import { ApiError, toUserMessage } from "@/lib/api/errors";
import type { ArtworkDetail, ArtworkSummary } from "@/lib/api/types";
import { pushRecent } from "@/lib/artwork";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { hexToRgba } from "@/theme/color";
import { useArtwork } from "@/hooks/artwork";
import { ArtworkImagePreviewModal } from "../components/ArtworkImagePreviewModal";

function toSummary(artwork: ArtworkDetail): ArtworkSummary {
  return {
    id: artwork.id,
    title: artwork.title,
    artist_display: artwork.artist_display,
    image_url: artwork.image_url,
    cached_image_uri: artwork.cached_image_uri,
    image_width: artwork.image_width,
    image_height: artwork.image_height,
    date_display: artwork.date_display,
    classification_title: artwork.classification_title,
    is_public_domain: artwork.is_public_domain,
  };
}

const SCROLL_TOP_THRESHOLD = 360;
const DETAILS_MS = 380;

function MetaCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  if (!value || typeof value !== "string") {
    return null;
  }
  return (
    <View className={`min-w-0 flex-1 gap-0.5 ${className}`.trim()}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text>{value}</Text>
    </View>
  );
}

function MetaPair({
  left,
  right,
}: {
  left: { label: string; value?: string | null };
  right: { label: string; value?: string | null };
}) {
  const leftOk = Boolean(left.value && typeof left.value === "string");
  const rightOk = Boolean(right.value && typeof right.value === "string");
  if (!leftOk && !rightOk) {
    return null;
  }
  return (
    <View className="flex-row gap-4 border-b border-border py-2.5 dark:border-border-dark">
      <MetaCell label={left.label} value={left.value} />
      <MetaCell label={right.label} value={right.value} />
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value || typeof value !== "string") {
    return null;
  }
  return (
    <View className="gap-0.5 border-b border-border py-2.5 dark:border-border-dark">
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text>{value}</Text>
    </View>
  );
}

function hasExtraDetails(artwork: ArtworkDetail) {
  return Boolean(
    artwork.credit_line ||
      artwork.accession_number ||
      artwork.current_location ||
      artwork.collection_title ||
      artwork.did_you_know ||
      artwork.artist_biography ||
      artwork.provenance_summary ||
      artwork.museum_url,
  );
}

export default function ArtworkDetailScreen() {
  const { colors } = useTheme();
  const { favorites } = useFavorites();
  const { id } = useLocalSearchParams<{ id: string }>();
  const artworkId = Number(id);
  const { data, isLoading, isError, error, refetch } = useArtwork(artworkId);
  const scrollRef = useRef<ScrollView>(null);
  const [showMore, setShowMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const detailsHeightRef = useRef(0);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(1)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const animatingRef = useRef(false);

  const runExpandAnimation = (expanded: boolean, height: number) => {
    animatingRef.current = true;
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: expanded ? height : 0,
        duration: DETAILS_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: expanded ? 1 : 0,
        duration: expanded ? 300 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(ctaAnim, {
        toValue: expanded ? 0 : 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        animatingRef.current = false;
      }
    });
  };

  const expandDetails = () => {
    if (animatingRef.current || showMore) {
      return;
    }
    setShowMore(true);

    const tryOpen = (attempts: number) => {
      const height = detailsHeightRef.current;
      if (height > 0) {
        heightAnim.setValue(0);
        opacityAnim.setValue(0);
        runExpandAnimation(true, height);
        return;
      }
      if (attempts <= 0) {
        animatingRef.current = false;
        return;
      }
      requestAnimationFrame(() => tryOpen(attempts - 1));
    };

    animatingRef.current = true;
    requestAnimationFrame(() => tryOpen(8));
  };

  const collapseDetails = () => {
    if (animatingRef.current || !showMore) {
      return;
    }
    setShowMore(false);
    runExpandAnimation(false, detailsHeightRef.current);
  };

  const showScrollTopRef = useRef(false);

  useEffect(() => {
    const artwork = data?.data;
    if (!artwork) {
      return;
    }
    pushRecent(toSummary(artwork));
  }, [data?.data]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const shouldShow = offsetY > SCROLL_TOP_THRESHOLD;
      if (shouldShow === showScrollTopRef.current) {
        return;
      }
      showScrollTopRef.current = shouldShow;
      setShowScrollTop(shouldShow);
      Animated.timing(fabAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [fabAnim],
  );

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (!Number.isFinite(artworkId) || artworkId <= 0) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Stack.Screen options={minimalStackHeaderOptions} />
        <EmptyState
          title="Obra inválida"
          description="El identificador de la obra no es válido."
          icon="alert-circle-outline"
          actionTitle="Ir a Colección"
          onAction={() => router.replace("/(app)/(tabs)/collection")}
          secondaryActionTitle="Volver al Home"
          onSecondaryAction={() => router.replace("/(app)/(tabs)")}
        />
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Stack.Screen options={minimalStackHeaderOptions} />
        <ArtworkDetailSkeleton />
      </Screen>
    );
  }

  const notFound =
    (isError && error instanceof ApiError && error.status === 404) ||
    (!isError && !data?.data);

  if (notFound) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Stack.Screen options={minimalStackHeaderOptions} />
        <EmptyState
          title="No encontramos la obra"
          description="Puede que el link esté mal o que ya no esté disponible en la API."
          icon="image-outline"
          actionTitle="Ir a Colección"
          onAction={() => router.replace("/(app)/(tabs)/collection")}
          secondaryActionTitle="Volver al Home"
          onSecondaryAction={() => router.replace("/(app)/(tabs)")}
        />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Stack.Screen options={minimalStackHeaderOptions} />
        <ErrorView
          description={toUserMessage(error)}
          onAction={refetch}
        />
      </Screen>
    );
  }

  const artwork = data?.data;
  if (!artwork) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Stack.Screen options={minimalStackHeaderOptions} />
        <EmptyState
          title="No encontramos la obra"
          description="Puede que ya no esté disponible en la API."
          icon="image-outline"
          actionTitle="Ir a Colección"
          onAction={() => router.replace("/(app)/(tabs)/collection")}
        />
      </Screen>
    );
  }

  const favoriteMatch = favorites.find((item) => item.id === artwork.id);
  const displayArtwork = favoriteMatch
    ? { ...artwork, cached_image_uri: favoriteMatch.cached_image_uri }
    : artwork;
  const imageUrl = resolveArtworkImageUrl(displayArtwork, 843);
  const canShowMore = hasExtraDetails(artwork);
  const bottomFadePad = 96;

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <Stack.Screen options={minimalStackHeaderOptions} />

      <View className="flex-1">
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: canShowMore && !showMore ? bottomFadePad : 40,
          }}
        >
          {imageUrl ? (
            <View
              className="mb-5 w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: 1, backgroundColor: colors.bg }}
            >
              <Image
                source={{ uri: imageUrl }}
                className="h-full w-full"
                resizeMode="contain"
                accessibilityIgnoresInvertColors
                accessibilityLabel={artwork.title || "Imagen de la obra"}
              />
              <ExpandImageButton onPress={() => setPreviewOpen(true)} />
            </View>
          ) : (
            <View
              className="mb-5 w-full items-center justify-center rounded-2xl"
              style={{ aspectRatio: 1, backgroundColor: colors.bg }}
            >
              <Text muted>Sin imagen</Text>
            </View>
          )}

          <View className="mb-1 flex-row items-start gap-2">
            <Text variant="title" className="flex-1">
              {artwork.title || "Sin título"}
            </Text>
            <FavoriteButton artwork={artwork} size={26} />
          </View>
          <Text muted className="mb-3">
            {artwork.artist_display || "Artista desconocido"}
          </Text>

          <MetaPair
            left={{ label: "Fecha", value: artwork.date_display }}
            right={{ label: "Origen", value: artwork.place_of_origin }}
          />
          <MetaPair
            left={{
              label: "Clasificación",
              value: artwork.classification_title,
            }}
            right={{
              label: "Dominio público",
              value: artwork.is_public_domain ? "Sí" : "No",
            }}
          />
          <MetaRow label="Medio" value={artwork.medium_display} />
          <MetaRow label="Dimensiones" value={artwork.dimensions} />
          <MetaRow label="Departamento" value={artwork.department_title} />

          {artwork.description ? (
            <View className="mt-3 gap-1.5">
              <Text variant="label">Descripción</Text>
              <HtmlContent html={artwork.description} muted />
            </View>
          ) : null}

          {canShowMore ? (
            <Animated.View
              pointerEvents={showMore ? "auto" : "none"}
              style={{
                overflow: "hidden",
                height: heightAnim,
                opacity: opacityAnim,
                marginTop: 8,
              }}
            >
              <View
                collapsable={false}
                className="absolute left-0 right-0"
                onLayout={(event) => {
                  const nextHeight = Math.ceil(event.nativeEvent.layout.height);
                  if (nextHeight <= 0) {
                    return;
                  }
                  const previous = detailsHeightRef.current;
                  detailsHeightRef.current = nextHeight;
                  if (
                    showMore &&
                    !animatingRef.current &&
                    previous !== nextHeight
                  ) {
                    heightAnim.setValue(nextHeight);
                  }
                }}
              >
                <MetaRow label="Colección" value={artwork.collection_title} />
                <MetaRow label="Ubicación" value={artwork.current_location} />
                <MetaRow label="Crédito" value={artwork.credit_line} />
                <MetaRow
                  label="Nº de acceso"
                  value={artwork.accession_number}
                />
                {artwork.did_you_know ? (
                  <View className="gap-0.5 border-b border-border py-2.5 dark:border-border-dark">
                    <Text variant="caption" muted>
                      ¿Sabías que…?
                    </Text>
                    <HtmlContent html={artwork.did_you_know} muted />
                  </View>
                ) : null}
                {artwork.artist_biography ? (
                  <View className="gap-0.5 border-b border-border py-2.5 dark:border-border-dark">
                    <Text variant="caption" muted>
                      Biografía del artista
                    </Text>
                    <HtmlContent html={artwork.artist_biography} muted />
                  </View>
                ) : null}
                {artwork.provenance_summary ? (
                  <View className="gap-0.5 border-b border-border py-2.5 dark:border-border-dark">
                    <Text variant="caption" muted>
                      Procedencia
                    </Text>
                    <Text muted>{artwork.provenance_summary}</Text>
                  </View>
                ) : null}
                <MetaRow label="Ficha del museo" value={artwork.museum_url} />

                <TouchableOpacity
                  activeOpacity={0.6}
                  hitSlop={8}
                  onPress={collapseDetails}
                  accessibilityRole="button"
                  accessibilityLabel="Ocultar detalles"
                  className="mt-4 flex-row items-center justify-center gap-1.5 self-center py-2"
                >
                  <TextLink>Ocultar detalles</TextLink>
                  <Icon name="chevron-up" size={16} color="accent" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : null}
        </ScrollView>

        {canShowMore ? (
          <Animated.View
            pointerEvents={showMore ? "none" : "auto"}
            className="absolute bottom-0 left-0 right-0"
            style={{
              paddingTop: 64,
              paddingBottom: 14,
              opacity: ctaAnim,
              transform: [
                {
                  translateY: ctaAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            }}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                hexToRgba(colors.bg, 0),
                hexToRgba(colors.bg, 0.45),
                hexToRgba(colors.bg, 0.88),
                colors.bg,
              ]}
              locations={[0, 0.28, 0.62, 1]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={expandDetails}
              accessibilityRole="button"
              accessibilityLabel="Ver más detalles"
              className="flex-row items-center justify-center gap-1.5 py-3"
            >
              <TextLink>Ver más detalles</TextLink>
              <Icon name="chevron-down" size={16} color="accent" />
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        <Animated.View
          pointerEvents={showScrollTop ? "auto" : "none"}
          className="absolute right-5 h-12 w-12 overflow-hidden rounded-full border border-border bg-surface dark:border-border-dark dark:bg-surface-dark"
          style={{
            bottom: canShowMore && !showMore ? 78 : 20,
            shadowColor: colors.text,
            shadowOpacity: 0.14,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
            opacity: fabAnim,
            transform: [
              {
                scale: fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity
            onPress={scrollToTop}
            accessibilityRole="button"
            accessibilityLabel="Volver arriba"
            className="flex-1 items-center justify-center"
          >
            <Icon name="arrow-up" size={20} color="text" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ArtworkImagePreviewModal
        visible={previewOpen}
        artwork={artwork}
        imageUrl={imageUrl}
        onClose={() => setPreviewOpen(false)}
      />
    </Screen>
  );
}
