import { View } from "react-native";
import type { SkeletonProps } from "./Skeleton.types";

export type { SkeletonProps } from "./Skeleton.types";

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <View
      className={`rounded-lg bg-border dark:bg-border-dark ${className}`.trim()}
    />
  );
}
