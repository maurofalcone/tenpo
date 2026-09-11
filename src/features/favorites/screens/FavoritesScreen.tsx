import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal as RNModal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { router, useFocusEffect, useNavigation } from "expo-router";
import {
  Button,
  EmptyState,
  Icon,
  Modal,
  MODAL_SHEET_MS,
  Screen,
  ScreenBody,
  Spinner,
  Text,
  useFadeHeaderContentInset,
} from "@/ui";
import { FeaturedMosaic } from "@/modules/FeaturedMosaic";
import type { ArtworkSummary } from "@/lib/api/types";
import {
  loadSkipFavoritesDeleteConfirm,
  saveSkipFavoritesDeleteConfirm,
} from "@/lib/favorites/prefs";
import { shareFavorites } from "@/lib/artwork";
import { hapticSelection, hapticSuccess } from "@/lib/haptics";
import { useNetworkStatus } from "@/hooks/network";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useTheme } from "@/providers/ThemeProvider";

type TabNavigation = {
  isFocused: () => boolean;
  addListener: (
    event: "tabPress",
    callback: () => void,
  ) => () => void;
};

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation() as unknown as TabNavigation;
  const { favorites, isHydrating, removeFavorites } = useFavorites();
  const { isOffline } = useNetworkStatus();
  const headerInset = useFadeHeaderContentInset();
  const scrollRef = useRef<ScrollView>(null);
  const deleteAfterDismissRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    return navigation.addListener("tabPress", () => {
      if (navigation.isFocused()) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        setHintOpen(false);
      }
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSkipFavoritesDeleteConfirm().then((skip) => {
        if (active) {
          setSkipConfirm(skip);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    return () => {
      if (deleteAfterDismissRef.current) {
        clearTimeout(deleteAfterDismissRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (favorites.length === 0 && selectionMode) {
      setSelectionMode(false);
      setSelectedIds(new Set());
    }
  }, [favorites.length, selectionMode]);

  const selectedCount = selectedIds.size;

  const countLabel = useMemo(() => {
    if (selectionMode) {
      return selectedCount === 0
        ? "Seleccioná obras"
        : `${selectedCount} ${selectedCount === 1 ? "seleccionada" : "seleccionadas"}`;
    }
    const n = favorites.length;
    return `${n} ${n === 1 ? "obra guardada" : "obras guardadas"}`;
  }, [favorites.length, selectionMode, selectedCount]);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const enterSelect = useCallback((artwork: ArtworkSummary) => {
    setHintOpen(false);
    hapticSelection();
    setSelectionMode(true);
    setSelectedIds(new Set([artwork.id]));
  }, []);

  const toggleSelect = useCallback((artwork: ArtworkSummary) => {
    hapticSelection();
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(artwork.id)) {
        next.delete(artwork.id);
      } else {
        next.add(artwork.id);
      }
      return next;
    });
  }, []);

  const onShareFavorites = useCallback(
    async (asSelection = false) => {
      const artworks = asSelection
        ? favorites.filter((item) => selectedIds.has(item.id))
        : favorites;
      if (sharing || artworks.length === 0) {
        return;
      }
      setSharing(true);
      try {
        await shareFavorites(artworks, { asSelection });
        hapticSuccess();
      } catch {
        Alert.alert("No se pudo compartir", "Intentá de nuevo en un momento.");
      } finally {
        setSharing(false);
      }
    },
    [favorites, selectedIds, sharing],
  );

  const onCompareSelected = useCallback(() => {
    if (selectedIds.size < 2 || selectedIds.size > 4) {
      return;
    }
    const ids = [...selectedIds].join(",");
    exitSelection();
    router.push(`/(app)/compare?ids=${ids}`);
  }, [exitSelection, selectedIds]);

  const applyDelete = useCallback(
    (ids: number[]) => {
      if (ids.length === 0) {
        return;
      }
      removeFavorites(ids);
      exitSelection();
    },
    [exitSelection, removeFavorites],
  );

  const onPressTrash = useCallback(() => {
    if (selectedIds.size === 0) {
      return;
    }
    if (skipConfirm) {
      applyDelete([...selectedIds]);
      return;
    }
    setDontShowAgain(false);
    setConfirmVisible(true);
  }, [applyDelete, selectedIds, skipConfirm]);

  const onConfirmDelete = useCallback(() => {
    const ids = [...selectedIds];
    if (dontShowAgain) {
      saveSkipFavoritesDeleteConfirm(true);
      setSkipConfirm(true);
    }

    // Cerrar primero: si mutamos la lista en el mismo frame, el mosaic
    // pelea con la animación de dismiss del sheet.
    setConfirmVisible(false);
    setDontShowAgain(false);

    if (deleteAfterDismissRef.current) {
      clearTimeout(deleteAfterDismissRef.current);
    }
    deleteAfterDismissRef.current = setTimeout(() => {
      deleteAfterDismissRef.current = null;
      applyDelete(ids);
    }, MODAL_SHEET_MS);
  }, [applyDelete, dontShowAgain, selectedIds]);

  return (
    <Screen edges={["left", "right"]}>
      <ScreenBody padded={false}>
        {isHydrating ? (
          <View className="flex-1 items-center justify-center">
            <Spinner size="large" />
          </View>
        ) : favorites.length === 0 ? (
          <View
            className="flex-1"
            style={{ paddingTop: headerInset }}
          >
            {isOffline ? <OfflineBanner /> : null}
            <EmptyState
              title="Sin favoritos"
              description="Marcá obras con el corazón en la colección o en el detalle."
              icon="heart-outline"
              actionTitle="Ir a Colección"
              onAction={() => router.push("/(app)/(tabs)/collection")}
              secondaryActionTitle="Ver Home"
              onSecondaryAction={() => router.push("/(app)/(tabs)")}
            />
          </View>
        ) : (
          <View className="flex-1">
            <View
              className="z-20 border-b border-border bg-bg dark:border-border-dark dark:bg-bg-dark"
              style={{ paddingTop: headerInset }}
            >
              {isOffline ? <OfflineBanner /> : null}
              <View className="mb-3 flex-row items-start justify-between gap-3 px-5">
                <View className="min-w-0 flex-1 gap-1">
                  <Text variant="title">
                    {selectionMode ? "Seleccionar" : "Favoritos"}
                  </Text>
                  <Text muted>{countLabel}</Text>
                </View>

                {selectionMode ? (
                  <View className="h-9 flex-row items-center">
                    <Pressable
                      onPress={onCompareSelected}
                      disabled={selectedCount < 2 || selectedCount > 4}
                      accessibilityRole="button"
                      accessibilityLabel="Comparar obras seleccionadas"
                      hitSlop={8}
                      className="h-9 w-9 items-center justify-center"
                      style={{
                        opacity:
                          selectedCount < 2 || selectedCount > 4 ? 0.4 : 1,
                      }}
                    >
                      <Icon
                        name="git-compare-outline"
                        size={22}
                        color="muted"
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        onShareFavorites(true);
                      }}
                      disabled={sharing || selectedCount === 0}
                      accessibilityRole="button"
                      accessibilityLabel="Compartir seleccionados"
                      hitSlop={8}
                      className="h-9 w-9 items-center justify-center"
                      style={{
                        opacity: sharing || selectedCount === 0 ? 0.4 : 1,
                      }}
                    >
                      <Icon name="share-outline" size={22} color="muted" />
                    </Pressable>
                    <Pressable
                      onPress={onPressTrash}
                      disabled={selectedCount === 0}
                      accessibilityRole="button"
                      accessibilityLabel="Eliminar seleccionados"
                      hitSlop={8}
                      className="h-9 w-9 items-center justify-center"
                      style={{ opacity: selectedCount === 0 ? 0.4 : 1 }}
                    >
                      <Icon name="trash-outline" size={22} color="danger" />
                    </Pressable>
                    <Pressable
                      onPress={exitSelection}
                      accessibilityRole="button"
                      accessibilityLabel="Cancelar selección"
                      hitSlop={8}
                      className="h-9 w-9 items-center justify-center"
                    >
                      <Icon name="close" size={22} color="muted" />
                    </Pressable>
                  </View>
                ) : (
                  <View className="h-9 flex-row items-center">
                    <Pressable
                      onPress={() => {
                        onShareFavorites(false);
                      }}
                      disabled={sharing}
                      accessibilityRole="button"
                      accessibilityLabel="Compartir favoritos"
                      hitSlop={8}
                      className="h-9 w-9 items-center justify-center"
                      style={{ opacity: sharing ? 0.5 : 1 }}
                    >
                      <Icon name="share-outline" size={22} color="muted" />
                    </Pressable>
                    <Pressable
                      onPress={() => setHintOpen((open) => !open)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: hintOpen }}
                      accessibilityLabel="Cómo eliminar favoritos"
                      hitSlop={8}
                      className="h-9 w-9 items-center justify-center"
                    >
                      <Icon
                        name={
                          hintOpen
                            ? "information-circle"
                            : "information-circle-outline"
                        }
                        size={24}
                        color="muted"
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: 56,
              }}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={() => setHintOpen(false)}
            >
              <FeaturedMosaic
                artworks={favorites}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onEnterSelect={enterSelect}
                onToggleSelect={toggleSelect}
              />
            </ScrollView>
          </View>
        )}
      </ScreenBody>

      <RNModal
        visible={hintOpen}
        transparent
        animationType="none"
        onRequestClose={() => setHintOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          className="flex-1 bg-transparent"
          onPress={() => setHintOpen(false)}
          accessibilityLabel="Cerrar ayuda"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="absolute right-5 w-[220px] rounded-[14px] border border-border bg-surface px-3.5 py-3 dark:border-border-dark dark:bg-surface-dark"
            style={{
              top: headerInset + 52,
              shadowColor: colors.text,
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
            accessibilityRole="text"
          >
            <Text variant="caption">
              Mantené presionada una obra para seleccionar, comparar hasta 4 o
              quitar una o varias de favoritos.
            </Text>
          </Pressable>
        </Pressable>
      </RNModal>

      <Modal
        visible={confirmVisible}
        title="Eliminar favoritos"
        onClose={() => setConfirmVisible(false)}
      >
        <View className="gap-4 pb-1">
          <Text muted>
            {selectedCount === 1
              ? "Vas a quitar 1 obra de favoritos. Esta acción no se puede deshacer."
              : `Vas a quitar ${selectedCount} obras de favoritos. Esta acción no se puede deshacer.`}
          </Text>

          <Pressable
            onPress={() => setDontShowAgain((value) => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: dontShowAgain }}
            className="flex-row items-center gap-3 py-1"
          >
            <View
              className="h-5 w-5 items-center justify-center rounded border"
              style={{
                borderColor: dontShowAgain ? colors.accent : colors.border,
                backgroundColor: dontShowAgain ? colors.accent : "transparent",
              }}
            >
              {dontShowAgain ? (
                <Icon name="checkmark" size={14} color="onAccent" />
              ) : null}
            </View>
            <Text className="flex-1">No volver a mostrar este mensaje</Text>
          </Pressable>

          <View className="flex-row gap-2">
            <Button
              title="Cancelar"
              variant="ghost"
              className="flex-1"
              onPress={() => setConfirmVisible(false)}
            />
            <Button
              title="Eliminar"
              variant="danger"
              className="flex-1"
              leftIcon="trash-outline"
              onPress={onConfirmDelete}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function OfflineBanner() {
  return (
    <View
      className="mx-5 mb-3 flex-row items-center gap-2 rounded-[12px] border border-border bg-surface px-3 py-2.5 dark:border-border-dark dark:bg-surface-dark"
      accessibilityRole="text"
      accessibilityLabel="Sin conexión. Mostrando favoritos en caché."
    >
      <Icon name="cloud-offline-outline" size={18} color="muted" />
      <Text muted className="flex-1 text-sm">
        Sin conexión — mostrando favoritos en caché.
      </Text>
    </View>
  );
}
