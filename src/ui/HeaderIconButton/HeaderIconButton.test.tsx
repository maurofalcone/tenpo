jest.mock("expo-router", () => ({
  router: {
    canGoBack: () => false,
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { HeaderIconButton } from "./HeaderIconButton";

describe("HeaderIconButton", () => {
  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <HeaderIconButton
        name="share-outline"
        accessibilityLabel="Compartir"
        onPress={onPress}
      />,
    );

    fireEvent.press(screen.getByLabelText("Compartir"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <HeaderIconButton
        name="print-outline"
        accessibilityLabel="Imprimir"
        onPress={onPress}
        disabled
      />,
    );

    fireEvent.press(screen.getByLabelText("Imprimir"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders optional label", async () => {
    await renderWithProviders(
      <HeaderIconButton
        name="share-outline"
        accessibilityLabel="Compartir obra"
        label="Compartir"
        onPress={() => undefined}
      />,
    );

    expect(screen.getByText("Compartir")).toBeTruthy();
  });

  it("shows spinner when loading", async () => {
    await renderWithProviders(
      <HeaderIconButton
        name="print-outline"
        accessibilityLabel="Imprimir"
        loading
        onPress={() => undefined}
      />,
    );

    expect(screen.getByTestId("header-icon-loading")).toBeTruthy();
  });
});
