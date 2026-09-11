import {
  areFiltersEqual,
  emptyFilters,
  hasFilters,
  hasKnownArtist,
  normalizeFilters,
  toApiFilters,
} from "../filters";
import { makeArtworkSummary } from "@/test/fixtures/artwork";

describe("filters helpers", () => {
  it("emptyFilters returns blank draft", () => {
    expect(emptyFilters()).toEqual({
      q: "",
      artist: "",
      classification: undefined,
      publicDomainOnly: false,
      knownArtistOnly: false,
    });
  });

  it("normalizeFilters trims and drops empties", () => {
    expect(
      normalizeFilters({
        q: "  moon  ",
        artist: " ",
        classification: "Painting",
        publicDomainOnly: false,
        knownArtistOnly: true,
      }),
    ).toEqual({
      q: "moon",
      artist: undefined,
      classification: "Painting",
      publicDomainOnly: undefined,
      knownArtistOnly: true,
    });
  });

  it("toApiFilters omits knownArtistOnly", () => {
    expect(
      toApiFilters({
        q: "a",
        knownArtistOnly: true,
        publicDomainOnly: true,
      }),
    ).toEqual({
      q: "a",
      artist: undefined,
      classification: undefined,
      publicDomainOnly: true,
    });
  });

  it("areFiltersEqual compares normalized values", () => {
    expect(
      areFiltersEqual({ q: " moon " }, { q: "moon", artist: "" }),
    ).toBe(true);
    expect(areFiltersEqual({ q: "a" }, { q: "b" })).toBe(false);
  });

  it("hasFilters detects active filters", () => {
    expect(hasFilters(emptyFilters())).toBe(false);
    expect(hasFilters({ ...emptyFilters(), q: "x" })).toBe(true);
  });

  it("hasKnownArtist rejects unknown labels", () => {
    expect(
      hasKnownArtist(makeArtworkSummary({ artist_display: "Claude Monet" })),
    ).toBe(true);
    expect(
      hasKnownArtist(makeArtworkSummary({ artist_display: "Unknown artist" })),
    ).toBe(false);
    expect(hasKnownArtist(makeArtworkSummary({ artist_display: null }))).toBe(
      false,
    );
  });
});
