import type { ArtworkDetail } from "@/lib/api/types";

export type ArtworkImagePreviewModalProps = {
  visible: boolean;
  artwork: ArtworkDetail;
  imageUrl: string | null;
  onClose: () => void;
};
