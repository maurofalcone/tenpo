import type { ArtworkFilters } from "@/lib/api/types";

export type ArtworkFiltersModalProps = {
  visible: boolean;
  initialFilters: ArtworkFilters;
  onClose: () => void;
  onApply: (filters: ArtworkFilters) => void;
};

export type Step = "filters" | "classification";
