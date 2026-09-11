import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect, useNavigation } from "expo-router";
import {
  ErrorView,
  FeaturedMosaicSkeleton,
  Screen,
  ScreenBody,
  Skeleton,
  Text,
  TextLink,
  useFadeHeaderContentInset,
} from "@/ui";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { emptyFilters } from "@/lib/artwork";
import { useArtworks, useRecentsList } from "@/hooks/artwork";
import { FeaturedMosaicList } from "@/modules/FeaturedMosaic";
import { toUserMessage } from "@/lib/api/errors";
import { DailyArtworkCard } from "../components/DailyArtworkCard";
import { RecentArtworksRow } from "../components/RecentArtworksRow";

const FEATURED_COUNT = 6;

type TabNavigation = {
  isFocused: () => boolean;
  addListener: (
    event: "tabPress",
    callback: () => void,
  ) => () => void;
};

function HomeSkeleton() {
  return (
    <View className="gap-5">
      <View className="px-5">
        <Skeleton className="h-[200px] w-full rounded-[18px]" />
      </View>
      <View className="gap-3">
        <View className="px-5">
          <Skeleton className="h-5 w-40 rounded-md" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2.5 px-5"
        >
          <Skeleton className="h-[148px] w-[112px] rounded-[14px]" />
          <Skeleton className="h-[148px] w-[112px] rounded-[14px]" />
          <Skeleton className="h-[148px] w-[112px] rounded-[14px]" />
        </ScrollView>
      </View>
      <View className="px-5">
        <FeaturedMosaicSkeleton rows={1} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation() as unknown as TabNavigation;
  const { session } = useAuth();
  const { recents } = useRecentsList();
  const headerInset = useFadeHeaderContentInset();
  const scrollRef = useRef<ScrollView>(null);
  const filters = useMemo(() => emptyFilters(), []);
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useArtworks(filters);
  const [pullRefreshing, setPullRefreshing] = useState(false);

  useEffect(() => {
    return navigation.addListener("tabPress", () => {
      if (navigation.isFocused()) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
  }, [navigation]);

  // Evita el RefreshControl “tildado” al volver del detalle / cambiar tab.
  useFocusEffect(
    useCallback(() => {
      setPullRefreshing(false);
    }, []),
  );

  const featured = useMemo(
    () => data?.pages[0]?.data.slice(0, FEATURED_COUNT) ?? [],
    [data],
  );
  const dailyCandidates = useMemo(
    () => data?.pages[0]?.data ?? [],
    [data],
  );

  const onPullRefresh = useCallback(async () => {
    setPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setPullRefreshing(false);
    }
  }, [refetch]);

  return (
    <Screen edges={[]}>
      <ScreenBody padded={false}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingTop: headerInset,
            paddingBottom: 56,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={onPullRefresh}
              tintColor={colors.accent}
            />
          }
        >
          <View className="mb-6 gap-2 px-5">
            <Text variant="title">
              {session?.email ? `Hola, ${session.email}` : "Hola"}
            </Text>
            <Text muted>
              Explorá la colección del Cleveland Museum of Art.
            </Text>
          </View>

          {isLoading ? (
            <HomeSkeleton />
          ) : isError ? (
            <View className="h-64 px-5">
              <ErrorView
                description={toUserMessage(error)}
                onAction={refetch}
                actionTitle={isRefetching ? "Cargando..." : "Reintentar"}
              />
            </View>
          ) : (
            <>
              <View className="px-5">
                <DailyArtworkCard candidates={dailyCandidates} />
              </View>
              <RecentArtworksRow artworks={recents} />

              <View className="mb-3 flex-row items-center justify-between gap-3 px-5">
                <Text variant="subtitle" className="flex-shrink">
                  Destacadas
                </Text>
                <TouchableOpacity
                  activeOpacity={0.6}
                  hitSlop={8}
                  onPress={() => router.push("/(app)/(tabs)/collection")}
                  accessibilityRole="button"
                  accessibilityLabel="Ver todas las obras"
                  className="py-1"
                >
                  <TextLink>Ver todas</TextLink>
                </TouchableOpacity>
              </View>

              <View className="px-5">
                <FeaturedMosaicList artworks={featured} />
              </View>
            </>
          )}
        </ScrollView>
      </ScreenBody>
    </Screen>
  );
}
