import { fireEvent, renderWithProviders, screen } from "@/test/render";
import { ExpandImageButton } from "./ExpandImageButton";

describe("ExpandImageButton", () => {
  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await renderWithProviders(<ExpandImageButton onPress={onPress} />);

    fireEvent.press(screen.getByLabelText("Ampliar imagen"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
