import * as Linking from "expo-linking";
import { createArtworkDeepLink } from "@/lib/artwork";

jest.mock("expo-linking", () => ({
  createURL: jest.fn((path: string) => `tenpo://${path}`),
}));

describe("createArtworkDeepLink", () => {
  it("builds a deep link for the artwork detail route", () => {
    expect(createArtworkDeepLink(94979)).toBe("tenpo://artwork/94979");
    expect(Linking.createURL).toHaveBeenCalledWith("artwork/94979");
  });
});
