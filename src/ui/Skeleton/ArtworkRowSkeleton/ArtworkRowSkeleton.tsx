import { View } from "react-native";
import { Skeleton } from "../Skeleton";

export function ArtworkRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 border-b border-border px-5 py-3 dark:border-border-dark">
      <Skeleton className="h-[72px] w-[72px] rounded-xl" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-3 w-[60%]" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </View>
    </View>
  );
}
