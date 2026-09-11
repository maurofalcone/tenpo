import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { Input } from "./Input";

describe("Input", () => {
  it("renders label and accepts text", async () => {
    const onChangeText = jest.fn();
    await renderWithProviders(
      <Input label="Email" value="" onChangeText={onChangeText} />,
    );

    expect(screen.getByText("Email")).toBeTruthy();
    fireEvent.changeText(screen.getByDisplayValue(""), "hola@tenpo.cl");
    expect(onChangeText).toHaveBeenCalledWith("hola@tenpo.cl");
  });

  it("shows an error message when provided", async () => {
    await renderWithProviders(
      <Input label="Email" value="bad" error="Email inválido" />,
    );

    expect(screen.getByText("Email inválido")).toBeTruthy();
  });

  it("is not editable when disabled", async () => {
    await renderWithProviders(
      <Input label="Email" value="a@b.com" disabled />,
    );

    expect(screen.getByDisplayValue("a@b.com").props.editable).toBe(false);
  });
});
