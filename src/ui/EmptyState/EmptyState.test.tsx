import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description", async () => {
    await renderWithProviders(
      <EmptyState
        title="Sin favoritos"
        description="Marcá obras con el corazón."
      />,
    );

    expect(screen.getByText("Sin favoritos")).toBeTruthy();
    expect(screen.getByText("Marcá obras con el corazón.")).toBeTruthy();
  });

  it("renders an action button when provided", async () => {
    const onAction = jest.fn();
    await renderWithProviders(
      <EmptyState
        title="Sin resultados"
        actionTitle="Limpiar filtros"
        onAction={onAction}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action without handler", async () => {
    await renderWithProviders(
      <EmptyState title="Vacío" actionTitle="Limpiar filtros" />,
    );

    expect(screen.queryByText("Limpiar filtros")).toBeNull();
  });

  it("renders a secondary action when provided", async () => {
    const onSecondary = jest.fn();
    await renderWithProviders(
      <EmptyState
        title="Sin favoritos"
        actionTitle="Ir a Colección"
        onAction={() => undefined}
        secondaryActionTitle="Ver Home"
        onSecondaryAction={onSecondary}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Ver Home" }));
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });
});
