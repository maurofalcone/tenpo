import { renderWithProviders, screen } from "@/test/render";
import { Text } from "../Text";
import { Screen, ScreenBody } from "./Screen";

describe("Screen", () => {
  it("renders screen body content", async () => {
    await renderWithProviders(
      <Screen>
        <ScreenBody>
          <Text>Perfil</Text>
        </ScreenBody>
      </Screen>,
    );

    expect(screen.getByText("Perfil")).toBeTruthy();
  });
});
