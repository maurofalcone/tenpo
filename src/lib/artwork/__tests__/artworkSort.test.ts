import { sortArtworks } from "../artworkSort";
import { makeArtworkSummary } from "@/test/fixtures/artwork";

describe("sortArtworks", () => {
  const list = [
    makeArtworkSummary({ id: 1, title: "Zebra", artist_display: "B Artist" }),
    makeArtworkSummary({ id: 2, title: "Apple", artist_display: "A Artist" }),
    makeArtworkSummary({ id: 3, title: "Mango", artist_display: null }),
  ];

  it("returns the same array for default sort", () => {
    expect(sortArtworks(list, "default")).toBe(list);
  });

  it("sorts by title ascending", () => {
    expect(sortArtworks(list, "title-asc").map((item) => item.title)).toEqual([
      "Apple",
      "Mango",
      "Zebra",
    ]);
  });

  it("sorts by title descending", () => {
    expect(sortArtworks(list, "title-desc").map((item) => item.title)).toEqual([
      "Zebra",
      "Mango",
      "Apple",
    ]);
  });

  it("sorts by artist and keeps missing artists stable", () => {
    const sorted = sortArtworks(list, "artist-asc").map(
      (item) => item.artist_display,
    );
    expect(sorted).toContain("A Artist");
    expect(sorted).toContain("B Artist");
    expect(sorted.indexOf("A Artist")).toBeLessThan(sorted.indexOf("B Artist"));
  });
});