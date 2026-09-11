import type { ArtworkSummary } from "@/lib/api/types";

export type FavoriteButtonProps = {
  artwork: ArtworkSummary;
  size?: number;
  tone?: "default" | "onMedia";
};
