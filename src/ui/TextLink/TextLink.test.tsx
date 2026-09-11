import { renderWithProviders, screen } from "@/test/render";
import { TextLink } from "./TextLink";

describe("TextLink", () => {
  it("renders children", async () => {
    await renderWithProviders(<TextLink>Ver más detalles</TextLink>);
    expect(screen.getByText("Ver más detalles")).toBeTruthy();
  });
});
