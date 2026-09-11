const mockToggleFavorite = jest.fn();
const mockIsFavorite = jest.fn((id: number) => id === 7);

jest.mock("expo-router", () => ({
  router: {
    canGoBack: () => false,
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock("@/lib/haptics", () => ({
  hapticImpact: jest.fn(),
  hapticWarning: jest.fn(),
  Haptics: { ImpactFeedbackStyle: { Medium: "medium" } },
}));

jest.mock("@/providers/FavoritesProvider", () => ({
  useFavorites: () => ({
    isFavorite: mockIsFavorite,
    toggleFavorite: mockToggleFavorite,
  }),
}));

import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { makeArtworkSummary } from "@/test/fixtures/artwork";
import { FavoriteButton } from "./FavoriteButton";

describe("FavoriteButton", () => {
  beforeEach(() => {
    mockToggleFavorite.mockClear();
    mockIsFavorite.mockClear();
    mockIsFavorite.mockImplementation((id: number) => id === 7);
  });

  it("shows add label when not favorite", async () => {
    await renderWithProviders(
      <FavoriteButton artwork={makeArtworkSummary({ id: 3 })} />,
    );
    expect(screen.getByLabelText("Agregar a favoritos")).toBeTruthy();
  });

  it("toggles favorite on press", async () => {
    const artwork = makeArtworkSummary({ id: 3 });
    await renderWithProviders(<FavoriteButton artwork={artwork} />);
    fireEvent.press(screen.getByLabelText("Agregar a favoritos"));
    expect(mockToggleFavorite).toHaveBeenCalledWith(artwork);
  });

  it("shows remove label when favorite", async () => {
    await renderWithProviders(
      <FavoriteButton artwork={makeArtworkSummary({ id: 7 })} />,
    );
    expect(screen.getByLabelText("Quitar de favoritos")).toBeTruthy();
  });
});
