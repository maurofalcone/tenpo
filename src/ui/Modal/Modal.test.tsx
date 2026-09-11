import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { Text } from "../Text";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders title and children when visible", async () => {
    await renderWithProviders(
      <Modal visible title="Filtros" onClose={jest.fn()}>
        <Text>Contenido del modal</Text>
      </Modal>,
    );

    expect(screen.getByText("Filtros")).toBeTruthy();
    expect(screen.getByText("Contenido del modal")).toBeTruthy();
  });

  it("calls onClose from the close button", async () => {
    const onClose = jest.fn();
    await renderWithProviders(
      <Modal visible title="Filtros" onClose={onClose}>
        <Text>Body</Text>
      </Modal>,
    );

    fireEvent.press(screen.getByLabelText("Cerrar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
