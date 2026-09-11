import { parseCompareIds } from "./CompareScreen.utils";

describe("parseCompareIds", () => {
  it("parses comma-separated ids and dedupes", () => {
    expect(parseCompareIds("1,2,2,3")).toEqual([1, 2, 3]);
  });

  it("accepts array params", () => {
    expect(parseCompareIds(["10", "20"])).toEqual([10, 20]);
  });

  it("caps at MAX_COMPARE", () => {
    expect(parseCompareIds("1,2,3,4,5")).toEqual([1, 2, 3, 4]);
  });

  it("ignores invalid values", () => {
    expect(parseCompareIds("1,foo,,3")).toEqual([1, 3]);
  });
});
