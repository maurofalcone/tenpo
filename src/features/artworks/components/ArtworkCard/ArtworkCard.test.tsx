jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    canGoBack: () => false,
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock("@/providers/FavoritesProvider", () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    toggleFavorite: jest.fn(),
  }),
}));

jest.mock("@/lib/haptics", () => ({
  hapticImpact: jest.fn(),
  hapticWarning: jest.fn(),
  Haptics: { ImpactFeedbackStyle: { Medium: "medium" } },
}));

import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { router } from "expo-router";
import { makeArtworkSummary } from "@/test/fixtures/artwork";
import { ArtworkCard } from "./ArtworkCard";

describe("ArtworkCard", () => {
  it("renders title and artist", async () => {
    await renderWithProviders(
      <ArtworkCard
        artwork={makeArtworkSummary({
          title: "Card Work",
          artist_display: null,
          image_url: null,
        })}
      />,
    );

    expect(screen.getByText("Card Work")).toBeTruthy();
    expect(screen.getByText("Artista desconocido")).toBeTruthy();
  });

  it("navigates to detail on press", async () => {
    await renderWithProviders(
      <ArtworkCard artwork={makeArtworkSummary({ id: 55, title: "Open" })} />,
    );

    fireEvent.press(screen.getByLabelText("Open"));
    expect(router.push).toHaveBeenCalledWith("/(app)/artwork/55");
  });
});
