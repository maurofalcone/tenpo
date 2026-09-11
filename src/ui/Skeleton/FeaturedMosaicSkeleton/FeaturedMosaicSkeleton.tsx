import { View } from "react-native";
import type { FeaturedMosaicSkeletonProps } from "./FeaturedMosaicSkeleton.types";

export type { FeaturedMosaicSkeletonProps } from "./FeaturedMosaicSkeleton.types";

function MosaicTile({ aspectRatio }: { aspectRatio: number }) {
  return (
    <View
      className="w-full overflow-hidden rounded-2xl bg-border dark:bg-border-dark"
      style={{ aspectRatio }}
    />
  );
}

function FeaturedMosaicRowSkeleton() {
  return (
    <View className="flex-row items-start gap-2">
      <View className="flex-1 gap-2">
        <MosaicTile aspectRatio={3 / 4} />
        <MosaicTile aspectRatio={1.1} />
        <MosaicTile aspectRatio={0.85} />
      </View>
      <View className="flex-1 gap-2">
        <MosaicTile aspectRatio={1} />
        <MosaicTile aspectRatio={0.7} />
        <MosaicTile aspectRatio={1.2} />
      </View>
    </View>
  );
}

export function FeaturedMosaicSkeleton({
  rows = 1,
}: FeaturedMosaicSkeletonProps) {
  return (
    <View className="gap-2" accessibilityLabel="Cargando destacadas">
      {Array.from({ length: rows }).map((_, index) => (
        <FeaturedMosaicRowSkeleton key={index} />
      ))}
    </View>
  );
}
