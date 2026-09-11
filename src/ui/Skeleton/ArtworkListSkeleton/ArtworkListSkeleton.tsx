import { View } from "react-native";
import { ArtworkRowSkeleton } from "../ArtworkRowSkeleton";
import type { ArtworkListSkeletonProps } from "./ArtworkListSkeleton.types";

export type { ArtworkListSkeletonProps } from "./ArtworkListSkeleton.types";

export function ArtworkListSkeleton({
  count = 8,
}: ArtworkListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <ArtworkRowSkeleton key={index} />
      ))}
    </View>
  );
}
