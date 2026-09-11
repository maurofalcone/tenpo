import { View } from "react-native";
import { Modal, Skeleton } from "@/ui";

type ArtworkFiltersModalSkeletonProps = {
  onClose: () => void;
};

/** Fallback de Suspense mientras carga el chunk lazy del modal de filtros. */
export function ArtworkFiltersModalSkeleton({
  onClose,
}: ArtworkFiltersModalSkeletonProps) {
  return (
    <Modal visible title="Filtros" onClose={onClose}>
      <View className="gap-3 pb-2" accessibilityLabel="Cargando filtros">
        <View>
          <Skeleton className="mb-2 h-4 w-16" />
          <Skeleton className="h-14 w-full rounded-[12px]" />
        </View>
        <View>
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-14 w-full rounded-[12px]" />
        </View>
        <View>
          <Skeleton className="mb-2 h-4 w-28" />
          <Skeleton className="h-14 w-full rounded-[12px]" />
        </View>
        <Skeleton className="h-14 w-full rounded-[12px]" />
        <Skeleton className="h-14 w-full rounded-[12px]" />
        <View className="mt-4 flex-row gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </View>
      </View>
    </Modal>
  );
}
