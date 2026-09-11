import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { HeaderIconButton } from "@/ui/HeaderIconButton";
import { exportArtworkPdf } from "@/lib/artwork";
import { hapticSuccess } from "@/lib/haptics";
import type { ExportArtworkPdfButtonProps } from "./ExportArtworkPdfButton.types";

export type { ExportArtworkPdfButtonProps } from "./ExportArtworkPdfButton.types";

export function ExportArtworkPdfButton({
  artwork,
}: ExportArtworkPdfButtonProps) {
  const [exporting, setExporting] = useState(false);

  const onExport = useCallback(async () => {
    if (exporting) {
      return;
    }
    setExporting(true);
    try {
      await exportArtworkPdf(artwork);
      hapticSuccess();
    } catch (error) {
      const detail =
        error instanceof Error && error.message
          ? error.message
          : "No pudimos generar el PDF. Probá de nuevo en un momento.";
      Alert.alert("No se pudo imprimir", detail);
    } finally {
      setExporting(false);
    }
  }, [artwork, exporting]);

  return (
    <HeaderIconButton
      name="print-outline"
      label="Imprimir"
      accessibilityLabel="Imprimir"
      onPress={onExport}
      loading={exporting}
    />
  );
}
