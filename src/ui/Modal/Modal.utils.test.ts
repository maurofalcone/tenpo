import { keyboardOverlap } from "./Modal.utils";

describe("keyboardOverlap", () => {
  it("uses screenY when available", () => {
    expect(
      keyboardOverlap({
        endCoordinates: { height: 300, screenY: 500, width: 390, screenX: 0 },
      } as never),
    ).toBeGreaterThan(0);
  });

  it("falls back to height", () => {
    expect(
      keyboardOverlap({
        endCoordinates: { height: 280, screenY: 0, width: 390, screenX: 0 },
      } as never),
    ).toBe(280);
  });
});
