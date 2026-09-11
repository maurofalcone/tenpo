import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { HeaderIconButton } from "@/ui/HeaderIconButton";
import { shareArtwork } from "@/lib/artwork";
import type { ShareArtworkButtonProps } from "./ShareArtworkButton.types";

export type { ShareArtworkButtonProps } from "./ShareArtworkButton.types";

export function ShareArtworkButton({
  id,
  title,
  artist,
}: ShareArtworkButtonProps) {
  const [sharing, setSharing] = useState(false);

  const onShare = useCallback(async () => {
    if (sharing) {
      return;
    }
    setSharing(true);
    try {
      await shareArtwork({ id, title, artist });
    } catch {
      Alert.alert("No se pudo compartir", "Probá de nuevo en un momento.");
    } finally {
      setSharing(false);
    }
  }, [artist, id, sharing, title]);

  return (
    <HeaderIconButton
      name="share-outline"
      label="Compartir"
      accessibilityLabel="Compartir obra"
      onPress={onShare}
      disabled={sharing}
    />
  );
}
