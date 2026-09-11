import { renderWithProviders, screen } from "@/test/render";
import { Text } from "./Text";

describe("Text", () => {
  it("renders children", async () => {
    await renderWithProviders(<Text>Hola Tenpo</Text>);
    expect(screen.getByText("Hola Tenpo")).toBeTruthy();
  });

  it("supports title variant", async () => {
    await renderWithProviders(<Text variant="title">Título</Text>);
    expect(screen.getByText("Título")).toBeTruthy();
  });
});
