import type { ArtworkDetail, ArtworkSummary } from "@/lib/api/types";

export function makeArtworkSummary(
  overrides: Partial<ArtworkSummary> = {},
): ArtworkSummary {
  return {
    id: 1,
    title: "Sample Title",
    artist_display: "Sample Artist",
    image_url: "https://example.com/art.jpg",
    image_width: 800,
    image_height: 1000,
    date_display: "1900",
    classification_title: "Painting",
    is_public_domain: true,
    ...overrides,
  };
}

export function makeArtworkDetail(
  overrides: Partial<ArtworkDetail> = {},
): ArtworkDetail {
  return {
    ...makeArtworkSummary(),
    medium_display: "Oil on canvas",
    place_of_origin: "France",
    dimensions: "100 x 80 cm",
    department_title: "Modern",
    description: null,
    credit_line: null,
    accession_number: null,
    current_location: null,
    collection_title: null,
    did_you_know: null,
    artist_biography: null,
    provenance_summary: null,
    museum_url: null,
    ...overrides,
  };
}
