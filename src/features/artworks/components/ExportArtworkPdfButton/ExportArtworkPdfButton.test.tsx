jest.mock("expo-router", () => ({
  router: {
    canGoBack: () => false,
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

const mockExportArtworkPdf = jest.fn(async () => undefined);
const mockHapticSuccess = jest.fn();

jest.mock("@/lib/artwork", () => ({
  exportArtworkPdf: (...args: unknown[]) =>
    mockExportArtworkPdf.apply(undefined, args),
}));

jest.mock("@/lib/haptics", () => ({
  hapticSuccess: (...args: unknown[]) =>
    mockHapticSuccess.apply(undefined, args),
}));

import { Alert } from "react-native";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/render";
import { makeArtworkDetail } from "@/test/fixtures/artwork";
import { ExportArtworkPdfButton } from "./ExportArtworkPdfButton";

describe("ExportArtworkPdfButton", () => {
  beforeEach(() => {
    mockExportArtworkPdf.mockClear();
    mockHapticSuccess.mockClear();
    mockExportArtworkPdf.mockResolvedValue(undefined);
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exports pdf on press", async () => {
    const artwork = makeArtworkDetail({ id: 9, title: "Print me" });
    await renderWithProviders(<ExportArtworkPdfButton artwork={artwork} />);

    fireEvent.press(screen.getByLabelText("Imprimir"));

    await waitFor(() => {
      expect(mockExportArtworkPdf).toHaveBeenCalledWith(artwork);
      expect(mockHapticSuccess).toHaveBeenCalled();
    });
  });

  it("alerts when export fails", async () => {
    mockExportArtworkPdf.mockRejectedValueOnce(new Error("fail"));
    await renderWithProviders(
      <ExportArtworkPdfButton artwork={makeArtworkDetail()} />,
    );

    fireEvent.press(screen.getByLabelText("Imprimir"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
