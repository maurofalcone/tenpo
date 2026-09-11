import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  Pressable,
  Text as RNText,
  View,
} from "react-native";
import { Icon } from "@/ui";
import { useTheme } from "@/providers/ThemeProvider";
import { CLASSIFICATION_OPTIONS } from "@/lib/artwork";
import type {
  ClassificationPickerListProps,
  PickerRow,
} from "./ClassificationPickerList.types";
import {
  LIST_MAX_HEIGHT,
  ROW_HEIGHT,
  scrollToSelected,
} from "./ClassificationPickerList.utils";

export { LIST_MAX_HEIGHT } from "./ClassificationPickerList.utils";
export type {
  ClassificationPickerListProps,
  PickerRow,
} from "./ClassificationPickerList.types";

export function ClassificationPickerList({
  selected,
  active = true,
  maxHeight = LIST_MAX_HEIGHT,
  onSelect,
}: ClassificationPickerListProps) {
  const { colors } = useTheme();
  const listRef = useRef<FlatList<PickerRow>>(null);
  const wasActiveRef = useRef(active);

  const rows = useMemo<PickerRow[]>(
    () => [
      { key: "__none__", label: "Sin clasificación", value: undefined },
      ...CLASSIFICATION_OPTIONS.map((option) => ({
        key: option,
        label: option,
        value: option,
      })),
    ],
    [],
  );

  const selectedRowIndex = useMemo(() => {
    if (!selected) {
      return 0;
    }
    const index = rows.findIndex((row) => row.value === selected);
    return index >= 0 ? index : 0;
  }, [rows, selected]);

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = active;

    // Al cerrar el paso: guardamos el scroll en la opción elegida
    // (el usuario ya está viendo el slide de salida, no nota el salto).
    if (wasActive && !active) {
      scrollToSelected(listRef, selectedRowIndex);
      return;
    }

    // Al abrir: posición ya lista, sin animación de "focus".
    if (!wasActive && active) {
      const frame = requestAnimationFrame(() => {
        scrollToSelected(listRef, selectedRowIndex);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [active, selectedRowIndex]);

  const handleSelect = useCallback(
    (value: string | undefined) => {
      const index =
        value == null
          ? 0
          : Math.max(
              0,
              rows.findIndex((row) => row.value === value),
            );
      // Dejamos el scroll listo antes de volver al paso filtros.
      scrollToSelected(listRef, index);
      onSelect(value);
    },
    [onSelect, rows],
  );

  const renderItem = useCallback(
    ({ item }: { item: PickerRow }) => {
      const isSelected =
        selected === item.value || (!selected && item.value == null);
      const isClearRow = item.value == null;

      return (
        <Pressable
          onPress={() => handleSelect(item.value)}
          style={{ height: ROW_HEIGHT }}
          className="flex-row items-center justify-between border-b border-border px-1 dark:border-border-dark"
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={item.label}
        >
          <RNText
            style={{
              color: isClearRow ? colors.muted : colors.text,
              fontSize: 16,
              fontWeight: isSelected ? "600" : "400",
              flex: 1,
              paddingRight: 12,
            }}
          >
            {item.label}
          </RNText>
          {isSelected ? (
            <Icon name="checkmark" size={22} color="accent" />
          ) : (
            <View style={{ width: 22 }} />
          )}
        </Pressable>
      );
    },
    [colors.muted, colors.text, handleSelect, selected],
  );

  return (
    <FlatList
      ref={listRef}
      data={rows}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      style={{ height: maxHeight }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={20}
      getItemLayout={(_, index) => ({
        length: ROW_HEIGHT,
        offset: ROW_HEIGHT * index,
        index,
      })}
      onScrollToIndexFailed={({ index }) => {
        const offset = Math.max(0, index * ROW_HEIGHT - maxHeight * 0.28);
        listRef.current?.scrollToOffset({ offset, animated: false });
      }}
    />
  );
}
