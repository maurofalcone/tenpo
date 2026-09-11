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
import { ArtworkRow } from "./ArtworkRow";

describe("ArtworkRow", () => {
  it("renders title and artist", async () => {
    await renderWithProviders(
      <ArtworkRow
        artwork={makeArtworkSummary({
          title: "The Lake",
          artist_display: "Hopper",
          image_url: null,
        })}
      />,
    );

    expect(screen.getByText("The Lake")).toBeTruthy();
    expect(screen.getByText("Hopper")).toBeTruthy();
    expect(screen.getByText("Sin img")).toBeTruthy();
  });

  it("navigates to detail on press", async () => {
    await renderWithProviders(
      <ArtworkRow artwork={makeArtworkSummary({ id: 42, title: "Go" })} />,
    );

    fireEvent.press(screen.getByLabelText("Go"));
    expect(router.push).toHaveBeenCalledWith("/(app)/artwork/42");
  });
});
