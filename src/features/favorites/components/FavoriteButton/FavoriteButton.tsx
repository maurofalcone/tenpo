import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable } from "react-native";
import { Icon } from "@/ui/Icon";
import { hapticImpact, hapticWarning, Haptics } from "@/lib/haptics";
import { useFavorites } from "@/providers/FavoritesProvider";
import { colors } from "@/theme/colors";
import type { FavoriteButtonProps } from "./FavoriteButton.types";

export type { FavoriteButtonProps } from "./FavoriteButton.types";

export function FavoriteButton({
  artwork,
  size = 22,
  tone = "default",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(artwork.id);
  const scale = useRef(new Animated.Value(1)).current;
  const prevActive = useRef(active);
  const inactiveColor = tone === "onMedia" ? colors.onMedia : "text";
  const activeColor = tone === "onMedia" ? colors.heartOnMedia : "danger";

  useEffect(() => {
    if (prevActive.current === active) {
      return;
    }
    prevActive.current = active;

    scale.setValue(active ? 0.72 : 1);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: active ? 1.28 : 0.86,
        duration: active ? 140 : 100,
        easing: Easing.out(Easing.back(2.2)),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, scale]);

  return (
    <Pressable
      hitSlop={10}
      onPress={(event) => {
        event.stopPropagation?.();
        if (active) {
          hapticWarning();
        } else {
          hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
        }
        toggleFavorite(artwork);
      }}
      accessibilityRole="button"
      accessibilityLabel={
        active ? "Quitar de favoritos" : "Agregar a favoritos"
      }
      accessibilityState={{ selected: active }}
      className={
        tone === "onMedia"
          ? "items-center justify-center"
          : "h-10 w-10 items-center justify-center rounded-full"
      }
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          name={active ? "heart" : "heart-outline"}
          size={size}
          color={active ? activeColor : inactiveColor}
        />
      </Animated.View>
    </Pressable>
  );
}
