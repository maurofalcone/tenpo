import { renderWithProviders, screen } from "@/test/render";
import { Icon } from "./Icon";
import { lightPalette } from "@/theme/palette";

describe("Icon", () => {
  it("resolves palette token colors", async () => {
    await renderWithProviders(
      <Icon name="heart" color="danger" size={24} testID="icon" />,
    );

    const icon = screen.getByTestId("icon");
    expect(icon.props.color).toBe(lightPalette.danger);
    expect(icon.props.size).toBe(24);
    expect(icon.props.name).toBe("heart");
  });

  it("accepts raw color values", async () => {
    await renderWithProviders(
      <Icon name="home" color="#112233" testID="icon" />,
    );

    const icon = screen.getByTestId("icon");
    expect(icon.props.color).toBe("#112233");
  });
});
