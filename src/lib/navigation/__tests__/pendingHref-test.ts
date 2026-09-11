import {
  consumePendingHref,
  peekPendingHref,
  setPendingHref,
} from "@/lib/navigation/pendingHref";

describe("pendingHref", () => {
  beforeEach(() => {
    setPendingHref(null);
  });

  it("stores and consumes a pending href once", () => {
    setPendingHref("/(app)/artwork/123");
    expect(peekPendingHref()).toBe("/(app)/artwork/123");
    expect(consumePendingHref()).toBe("/(app)/artwork/123");
    expect(consumePendingHref()).toBeNull();
  });
});
