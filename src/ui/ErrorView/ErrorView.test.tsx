import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { ErrorView } from "./ErrorView";

describe("ErrorView", () => {
  it("renders default title and description", async () => {
    await renderWithProviders(<ErrorView description="Falló la red" />);

    expect(screen.getByText("Algo salió mal")).toBeTruthy();
    expect(screen.getByText("Falló la red")).toBeTruthy();
  });

  it("calls onAction when retry is pressed", async () => {
    const onAction = jest.fn();
    await renderWithProviders(
      <ErrorView description="Falló la red" onAction={onAction} />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Reintentar" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("hides retry button when onAction is missing", async () => {
    await renderWithProviders(<ErrorView description="Falló la red" />);
    expect(screen.queryByText("Reintentar")).toBeNull();
  });
});
