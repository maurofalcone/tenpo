import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { Text } from "../Text";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", async () => {
    await renderWithProviders(
      <Card>
        <Text>Contenido</Text>
      </Card>,
    );

    expect(screen.getByText("Contenido")).toBeTruthy();
  });

  it("calls onPress when pressable", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Card pressable onPress={onPress}>
        <Text>Abrir</Text>
      </Card>,
    );

    fireEvent.press(screen.getByText("Abrir"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
