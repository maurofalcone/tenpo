import { View } from "react-native";
import { Skeleton } from "../Skeleton";

export function ArtworkDetailSkeleton() {
  return (
    <View className="gap-4 px-5 pt-2">
      <Skeleton className="h-72 w-full rounded-2xl" />
      <Skeleton className="h-7 w-[80%]" />
      <Skeleton className="h-4 w-[60%]" />
      <Skeleton className="h-4 w-[40%]" />
      <View className="mt-2 gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[66%]" />
      </View>
    </View>
  );
}
