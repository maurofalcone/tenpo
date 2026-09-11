import { Text } from "react-native";
import { renderWithProviders, screen } from "@/test/render";
import {
  HEADER_BAR_HEIGHT,
  useFadeHeaderContentInset,
} from "./FadeHeaderBackground";

function InsetProbe() {
  const inset = useFadeHeaderContentInset();
  return <Text>{`inset:${inset}`}</Text>;
}

describe("FadeHeaderBackground helpers", () => {
  it("exposes header bar height", () => {
    expect(HEADER_BAR_HEIGHT).toBe(44);
  });

  it("computes content inset with safe area", async () => {
    await renderWithProviders(<InsetProbe />);
    // test SafeAreaProvider top inset is 47 + bar 44 + extra 4
    expect(screen.getByText("inset:95")).toBeTruthy();
  });
});
