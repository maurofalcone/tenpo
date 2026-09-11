jest.mock("expo-router", () => ({
  router: {
    canGoBack: () => false,
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

const mockShareArtwork = jest.fn(async () => undefined);

jest.mock("@/lib/artwork", () => ({
  shareArtwork: (...args: unknown[]) => mockShareArtwork.apply(undefined, args),
}));

import { Alert } from "react-native";
import { fireEvent, renderWithProviders, screen, waitFor } from "@/test/render";
import { ShareArtworkButton } from "./ShareArtworkButton";

describe("ShareArtworkButton", () => {
  beforeEach(() => {
    mockShareArtwork.mockClear();
    mockShareArtwork.mockResolvedValue(undefined);
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shares artwork on press", async () => {
    await renderWithProviders(
      <ShareArtworkButton id={12} title="Moon" artist="Artist" />,
    );

    fireEvent.press(screen.getByLabelText("Compartir obra"));

    await waitFor(() => {
      expect(mockShareArtwork).toHaveBeenCalledWith({
        id: 12,
        title: "Moon",
        artist: "Artist",
      });
    });
  });

  it("alerts when share fails", async () => {
    mockShareArtwork.mockRejectedValueOnce(new Error("fail"));
    await renderWithProviders(
      <ShareArtworkButton id={12} title="Moon" artist={null} />,
    );

    fireEvent.press(screen.getByLabelText("Compartir obra"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
