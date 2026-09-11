import { hexToRgba } from "../color";

describe("hexToRgba", () => {
  it("expands short hex", () => {
    expect(hexToRgba("#abc", 0.5)).toBe("rgba(170, 187, 204, 0.5)");
  });

  it("parses full hex", () => {
    expect(hexToRgba("#161412", 0.88)).toBe("rgba(22, 20, 18, 0.88)");
  });

  it("accepts hex without hash", () => {
    expect(hexToRgba("F6F1EA", 0)).toBe("rgba(246, 241, 234, 0)");
  });
});
