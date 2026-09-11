import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { Button } from "./Button";

describe("Button", () => {
  it("renders the title", async () => {
    await renderWithProviders(<Button title="Continuar" />);
    expect(screen.getByText("Continuar")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await renderWithProviders(<Button title="Enviar" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Enviar" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Button title="Enviar" disabled onPress={onPress} />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Enviar" }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not call onPress while loading", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Button title="Enviar" loading onPress={onPress} />,
    );

    const button = screen.getByRole("button");
    expect(button.props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
