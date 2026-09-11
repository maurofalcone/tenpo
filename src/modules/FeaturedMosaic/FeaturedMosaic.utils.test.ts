import {
  DEFAULT_ASPECT_RATIO,
  distributeColumns,
  getArtworkAspectRatio,
  MAX_ASPECT,
  MIN_ASPECT,
} from "./FeaturedMosaic.utils";
import { makeArtworkSummary } from "@/test/fixtures/artwork";

describe("getArtworkAspectRatio", () => {
  it("returns default when dimensions missing", () => {
    expect(
      getArtworkAspectRatio(
        makeArtworkSummary({ image_width: null, image_height: null }),
      ),
    ).toBe(DEFAULT_ASPECT_RATIO);
  });

  it("clamps extreme ratios", () => {
    expect(
      getArtworkAspectRatio(
        makeArtworkSummary({ image_width: 4000, image_height: 100 }),
      ),
    ).toBe(MAX_ASPECT);
    expect(
      getArtworkAspectRatio(
        makeArtworkSummary({ image_width: 100, image_height: 4000 }),
      ),
    ).toBe(MIN_ASPECT);
  });
});

describe("distributeColumns", () => {
  it("splits artworks left/right by index", () => {
    const artworks = [1, 2, 3, 4].map((id) => makeArtworkSummary({ id }));
    expect(distributeColumns(artworks)).toEqual({
      left: [artworks[0], artworks[2]],
      right: [artworks[1], artworks[3]],
    });
  });
});
