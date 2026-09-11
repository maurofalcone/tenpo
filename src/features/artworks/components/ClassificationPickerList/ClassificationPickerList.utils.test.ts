import { LIST_MAX_HEIGHT, ROW_HEIGHT } from "./ClassificationPickerList.utils";

describe("ClassificationPickerList.utils", () => {
  it("exposes row metrics", () => {
    expect(ROW_HEIGHT).toBe(52);
    expect(LIST_MAX_HEIGHT).toBeGreaterThan(0);
  });
});
