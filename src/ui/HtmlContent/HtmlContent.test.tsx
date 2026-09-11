jest.mock("react-native-render-html", () =>
  require("../../test/mocks/react-native-render-html"),
);

import { renderWithProviders, screen } from "@/test/render";
import { HtmlContent } from "./HtmlContent";

describe("HtmlContent", () => {
  it("renders wrapped plain text", async () => {
    await renderWithProviders(<HtmlContent html="Hola museo" />);
    expect(screen.getByTestId("html-content").props.children).toBe(
      "<p>Hola museo</p>",
    );
  });

  it("returns null for empty html", async () => {
    await renderWithProviders(<HtmlContent html="   " />);
    expect(screen.queryByTestId("html-content")).toBeNull();
  });
});
