export type ArtworkSummary = {
  id: number;
  title: string;
  artist_display: string | null;
  image_url: string | null;
  /** URI local cacheada para ver favoritos offline. */
  cached_image_uri?: string | null;
  image_width: number | null;
  image_height: number | null;
  date_display: string | null;
  classification_title: string | null;
  is_public_domain: boolean;
};

export type ArtworkDetail = ArtworkSummary & {
  medium_display: string | null;
  place_of_origin: string | null;
  dimensions: string | null;
  department_title: string | null;
  description: string | null;
  /** Campos extra (expandibles en UI). */
  credit_line: string | null;
  accession_number: string | null;
  current_location: string | null;
  collection_title: string | null;
  did_you_know: string | null;
  artist_biography: string | null;
  provenance_summary: string | null;
  museum_url: string | null;
};

export type ArtworkPagination = {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
};

export type ArtworkListResponse = {
  data: ArtworkSummary[];
  pagination: ArtworkPagination;
};

export type ArtworkItemResponse = {
  data: ArtworkDetail;
};

export type ArtworkFilters = {
  q?: string;
  artist?: string;
  classification?: string;
  publicDomainOnly?: boolean;
  /** FE only: oculta obras sin artista conocido. */
  knownArtistOnly?: boolean;
};
