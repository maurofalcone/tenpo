import { renderWithProviders, screen } from "@/test/render";
import { Spinner } from "./Spinner";
import { lightPalette } from "@/theme/palette";

describe("Spinner", () => {
  it("uses accent color by default", async () => {
    await renderWithProviders(<Spinner testID="spinner" />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner.props.color).toBe(lightPalette.accent);
  });

  it("resolves palette tokens", async () => {
    await renderWithProviders(
      <Spinner color="danger" size="large" testID="spinner" />,
    );
    const spinner = screen.getByTestId("spinner");
    expect(spinner.props.color).toBe(lightPalette.danger);
    expect(spinner.props.size).toBe("large");
  });
});
