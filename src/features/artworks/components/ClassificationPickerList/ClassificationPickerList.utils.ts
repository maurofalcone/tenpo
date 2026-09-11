import type { RefObject } from "react";
import type { FlatList } from "react-native";
import { Dimensions } from "react-native";
import type { PickerRow } from "./ClassificationPickerList.types";

export const LIST_MAX_HEIGHT = Math.min(
  Dimensions.get("window").height * 0.5,
  360,
);
export const ROW_HEIGHT = 52;

export function scrollToSelected(
  listRef: RefObject<FlatList<PickerRow> | null>,
  index: number,
) {
  listRef.current?.scrollToIndex({
    index,
    animated: false,
    viewPosition: 0.28,
    viewOffset: 12,
  });
}
