import type { StyleProp, ViewStyle } from "react-native";
import type { ArtworkSummary } from "@/lib/api/types";

export type FeaturedTileProps = {
  artwork: ArtworkSummary;
  style?: StyleProp<ViewStyle>;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (artwork: ArtworkSummary) => void;
  onEnterSelect?: (artwork: ArtworkSummary) => void;
};

export type FeaturedMosaicProps = {
  artworks: ArtworkSummary[];
  selectionMode?: boolean;
  selectedIds?: ReadonlySet<number>;
  onToggleSelect?: (artwork: ArtworkSummary) => void;
  onEnterSelect?: (artwork: ArtworkSummary) => void;
};

export type FeaturedMosaicListProps = {
  artworks: ArtworkSummary[];
};
