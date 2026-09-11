import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Modal as RNModal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text as RNText,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArtworkListSkeleton,
  EmptyState,
  ErrorView,
  Icon,
  Screen,
  Spinner,
  Text,
} from "@/ui";
import {
  useCollectionControls,
  useCollectionFeed,
} from "@/hooks/artwork";
import {
  ARTWORK_SORT_OPTIONS,
  COLLECTION_VIEW_OPTIONS,
  sortArtworks,
  type ArtworkSortId,
  type CollectionViewMode,
} from "@/lib/artwork";
import type { ArtworkSummary } from "@/lib/api/types";
import { toUserMessage } from "@/lib/api/errors";
import { useTheme } from "@/providers/ThemeProvider";
import { hexToRgba } from "@/theme/color";
import { ArtworkCard, ARTWORK_CARD_LAYOUT } from "../components/ArtworkCard";
import { ArtworkFiltersModalSkeleton } from "../components/ArtworkFiltersModal/ArtworkFiltersModalSkeleton";
import { ArtworkRow } from "../components/ArtworkRow";

const ArtworkFiltersModal = lazy(() =>
  import("../components/ArtworkFiltersModal/ArtworkFiltersModal").then(
    (mod) => ({
      default: mod.ArtworkFiltersModal,
    }),
  ),
);
type TabNavigation = {
  isFocused: () => boolean;
  addListener: (
    event: "tabPress",
    callback: () => void,
  ) => () => void;
};

export default function CollectionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as unknown as TabNavigation;
  const listRef = useRef<FlatList<ArtworkSummary>>(null);
  const listAnim = useRef(new Animated.Value(1)).current;
  const [filtersMounted, setFiltersMounted] = useState(false);

  const {
    filters,
    setFilters,
    filtersOpen,
    setFiltersOpen,
    openFilters,
    clearFilters,
    filtersActive,
    activeChips,
    sort,
    sortActive,
    selectedSortLabel,
    sortMenuOpen,
    toggleSortMenu,
    selectSort,
    viewMode,
    viewMenuOpen,
    toggleViewMenu,
    selectViewMode,
    closeMenus,
  } = useCollectionControls();

  const handleOpenFilters = useCallback(() => {
    setFiltersMounted(true);
    openFilters();
  }, [openFilters]);

  const {
    artworks,
    total,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    pullRefreshing,
    onEndReached,
    onPullRefresh,
  } = useCollectionFeed(filters);

  const sortedArtworks = useMemo(
    () => sortArtworks(artworks, sort),
    [artworks, sort],
  );
  const showBottomFade = sortedArtworks.length > 0 && hasNextPage;

  useEffect(() => {
    return navigation.addListener("tabPress", () => {
      if (navigation.isFocused()) {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
        closeMenus();
      }
    });
  }, [navigation, closeMenus]);

  const animateListChange = useCallback(
    (apply: () => void) => {
      Animated.timing(listAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }
        apply();
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
        Animated.timing(listAnim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    },
    [listAnim],
  );

  const onSelectSort = useCallback(
    (next: ArtworkSortId) => {
      if (next === sort) {
        closeMenus();
        return;
      }
      closeMenus();
      animateListChange(() => {
        selectSort(next);
      });
    },
    [animateListChange, closeMenus, selectSort, sort],
  );

  const onSelectViewMode = useCallback(
    (next: CollectionViewMode) => {
      if (next === viewMode) {
        closeMenus();
        return;
      }
      closeMenus();
      animateListChange(() => {
        selectViewMode(next);
      });
    },
    [animateListChange, closeMenus, selectViewMode, viewMode],
  );

  return (
    <Screen edges={["left", "right"]}>
      <View className="z-20 border-b border-border bg-bg dark:border-border-dark dark:bg-bg-dark">
        <View className="gap-3 px-5 pb-2.5 pt-1">
          <View className="gap-1">
            <Text variant="title">Colección</Text>
            <Text muted variant="caption">
              {total
                ? `${total.toLocaleString()} obras`
                : "Explorá todas las obras"}
            </Text>
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={toggleSortMenu}
                accessibilityRole="button"
                accessibilityState={{ expanded: sortMenuOpen, selected: sortActive }}
                accessibilityLabel="Ordenar resultados cargados"
                className={`flex-row items-center gap-1 rounded-full border px-3 py-2 ${
                  sortActive
                    ? "border-accent bg-accent dark:border-accent-dark dark:bg-accent-dark"
                    : "border-border bg-transparent dark:border-border-dark"
                }`}
              >
                <RNText
                  numberOfLines={1}
                  style={{
                    color: sortActive ? colors.onAccent : colors.text,
                    fontSize: 12,
                    fontWeight: "600",
                    maxWidth: 96,
                  }}
                >
                  {selectedSortLabel}
                </RNText>
                <Icon
                  name={sortMenuOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={sortActive ? "onAccent" : "muted"}
                />
              </Pressable>

              <Pressable
                onPress={handleOpenFilters}
                hitSlop={8}
                className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
                  filtersActive
                    ? "border-accent bg-accent dark:border-accent-dark dark:bg-accent-dark"
                    : "border-border bg-transparent dark:border-border-dark"
                }`}
                accessibilityRole="button"
                accessibilityLabel="Abrir filtros"
                accessibilityState={{ selected: filtersActive }}
              >
                <Icon
                  name="options-outline"
                  size={18}
                  color={filtersActive ? "onAccent" : "text"}
                />
                <RNText
                  style={{
                    color: filtersActive ? colors.onAccent : colors.text,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Filtros
                </RNText>
                {filtersActive ? (
                  <View className="min-w-[18px] items-center justify-center rounded-full bg-on-accent px-1.5 py-0.5 dark:bg-on-accent-dark">
                    <RNText
                      style={{
                        color: colors.accent,
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {activeChips.length}
                    </RNText>
                  </View>
                ) : null}
              </Pressable>
            </View>

            <Pressable
              onPress={toggleViewMenu}
              accessibilityRole="button"
              accessibilityState={{
                expanded: viewMenuOpen,
              }}
              accessibilityLabel="Cambiar formato de vista"
              className="h-9 w-9 items-center justify-center rounded-full border border-accent bg-accent dark:border-accent-dark dark:bg-accent-dark"
            >
              <Icon
                name={viewMode === "cards" ? "grid" : "list"}
                size={18}
                color="onAccent"
              />
            </Pressable>
          </View>
        </View>

        {activeChips.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row items-center gap-2 px-5"
            className="mb-2.5 mt-2.5"
          >
            {activeChips.map((chip) => (
              <Pressable
                key={chip.key}
                onPress={chip.clear}
                className="flex-row items-center gap-1 rounded-full bg-surface px-3 py-1.5 dark:bg-surface-dark"
                style={{
                  borderWidth: 1,
                  borderColor: colors.text,
                }}
              >
                <RNText
                  style={{
                    color: colors.text,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  {chip.label}
                </RNText>
                <Icon name="close" size={14} color="text" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {isLoading ? (
        <ArtworkListSkeleton />
      ) : isError ? (
        <ErrorView
          description={toUserMessage(error)}
          onAction={refetch}
        />
      ) : sortedArtworks.length === 0 ? (
        <EmptyState
          title="No encontramos obras"
          description={
            filtersActive
              ? "Probá limpiar los filtros o cambiar la búsqueda."
              : "La API no devolvió resultados. Podés reintentar en un momento."
          }
          actionTitle={filtersActive ? "Limpiar filtros" : "Reintentar"}
          onAction={filtersActive ? clearFilters : refetch}
        />
      ) : (
        <View className="relative flex-1">
          <Animated.View
            style={{
              flex: 1,
              opacity: listAnim,
              transform: [
                {
                  translateY: listAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            }}
          >
            <FlatList
              key={viewMode}
              ref={listRef}
              data={sortedArtworks}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              numColumns={viewMode === "cards" ? 2 : 1}
              columnWrapperStyle={
                viewMode === "cards"
                  ? {
                      gap: ARTWORK_CARD_LAYOUT.GAP,
                      paddingHorizontal: ARTWORK_CARD_LAYOUT.H_PAD,
                      marginBottom: ARTWORK_CARD_LAYOUT.GAP,
                    }
                  : undefined
              }
              contentContainerStyle={
                viewMode === "cards" ? { paddingTop: 12 } : undefined
              }
              renderItem={({ item }) =>
                viewMode === "cards" ? (
                  <ArtworkCard artwork={item} />
                ) : (
                  <ArtworkRow artwork={item} />
                )
              }
              onEndReached={onEndReached}
              onEndReachedThreshold={0.4}
              onScrollBeginDrag={closeMenus}
              removeClippedSubviews={false}
              maxToRenderPerBatch={viewMode === "cards" ? 8 : 10}
              windowSize={7}
              refreshControl={
                <RefreshControl
                  refreshing={pullRefreshing}
                  onRefresh={onPullRefresh}
                  tintColor={colors.accent}
                />
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="items-center py-4">
                    <Spinner />
                  </View>
                ) : (
                  <View className="h-10" />
                )
              }
            />
          </Animated.View>
          {showBottomFade ? (
            <LinearGradient
              pointerEvents="none"
              colors={[
                hexToRgba(colors.bg, 0),
                hexToRgba(colors.bg, 0.72),
                colors.bg,
              ]}
              locations={[0, 0.55, 1]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 72,
              }}
            />
          ) : null}
        </View>
      )}

      <RNModal
        visible={sortMenuOpen}
        transparent
        animationType="none"
        onRequestClose={closeMenus}
        statusBarTranslucent
      >
        <View className="flex-1 bg-transparent">
          <Pressable
            className="absolute inset-0"
            onPress={closeMenus}
            accessibilityLabel="Cerrar menú de orden"
          />
          <View
            className="absolute z-[2] overflow-hidden rounded-[14px] border border-border bg-surface dark:border-border-dark dark:bg-surface-dark"
            style={{
              top: insets.top + 110,
              left: 20,
              shadowColor: colors.text,
              minWidth: 168,
              shadowOpacity: 0.14,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            }}
          >
            {ARTWORK_SORT_OPTIONS.map((option, index) => {
              const selected = sort === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => onSelectSort(option.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`flex-row items-center justify-between px-3.5 py-3 ${
                    index === 0 ? "" : "border-t border-border dark:border-border-dark"
                  } ${selected ? "bg-bg dark:bg-bg-dark" : "bg-surface dark:bg-surface-dark"}`}
                >
                  <RNText
                    className={`text-sm text-text dark:text-text-dark ${
                      selected ? "font-semibold" : "font-normal"
                    }`}
                  >
                    {option.label}
                  </RNText>
                  {selected ? (
                    <Icon name="checkmark" size={18} color="accent" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </RNModal>

      <RNModal
        visible={viewMenuOpen}
        transparent
        animationType="none"
        onRequestClose={closeMenus}
        statusBarTranslucent
      >
        <View className="flex-1 bg-transparent">
          <Pressable
            className="absolute inset-0"
            onPress={closeMenus}
            accessibilityLabel="Cerrar menú de vista"
          />
          <View
            className="absolute z-[2] overflow-hidden rounded-[14px] border border-border bg-surface dark:border-border-dark dark:bg-surface-dark"
            style={{
              top: insets.top + 110,
              right: 20,
              shadowColor: colors.text,
              minWidth: 148,
              shadowOpacity: 0.14,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            }}
          >
            {COLLECTION_VIEW_OPTIONS.map((option, index) => {
              const selected = viewMode === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => onSelectViewMode(option.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`flex-row items-center gap-2.5 px-3.5 py-3 ${
                    index === 0 ? "" : "border-t border-border dark:border-border-dark"
                  } ${selected ? "bg-bg dark:bg-bg-dark" : "bg-surface dark:bg-surface-dark"}`}
                >
                  <Icon
                    name={option.icon}
                    size={18}
                    color={selected ? "accent" : "text"}
                  />
                  <RNText
                    className={`flex-1 text-sm text-text dark:text-text-dark ${
                      selected ? "font-semibold" : "font-normal"
                    }`}
                  >
                    {option.label}
                  </RNText>
                  {selected ? (
                    <Icon name="checkmark" size={18} color="accent" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </RNModal>

      {filtersMounted ? (
        <Suspense
          fallback={
            filtersOpen ? (
              <ArtworkFiltersModalSkeleton
                onClose={() => setFiltersOpen(false)}
              />
            ) : null
          }
        >
          <ArtworkFiltersModal
            visible={filtersOpen}
            initialFilters={filters}
            onClose={() => setFiltersOpen(false)}
            onApply={setFilters}
          />
        </Suspense>
      ) : null}
    </Screen>
  );
}
