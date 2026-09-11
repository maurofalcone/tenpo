import { apiRequest } from "./client";
import type {
  ArtworkDetail,
  ArtworkFilters,
  ArtworkItemResponse,
  ArtworkListResponse,
  ArtworkSummary,
} from "./types";

const PAGE_SIZE = 20;

type ClevelandCreator = {
  description?: string | null;
  biography?: string | null;
};

type ClevelandProvenance = {
  description?: string | null;
};

type ClevelandImages = {
  web?: {
    url?: string | null;
    width?: string | number | null;
    height?: string | number | null;
  } | null;
};

type ClevelandArtwork = {
  id: number;
  title?: string | null;
  creators?: ClevelandCreator[] | null;
  images?: ClevelandImages | null;
  creation_date?: string | null;
  date_text?: string | null;
  type?: string | null;
  share_license_status?: string | null;
  technique?: string | null;
  culture?: string[] | null;
  dimensions?: string | Record<string, unknown> | null;
  measurements?: string | null;
  department?: string | null;
  description?: string | null;
  wall_description?: string | null;
  creditline?: string | null;
  accession_number?: string | null;
  current_location?: string | null;
  collection?: string | null;
  did_you_know?: string | null;
  provenance?: ClevelandProvenance[] | null;
  url?: string | null;
};

type ClevelandListResponse = {
  info: { total: number };
  data: ClevelandArtwork[];
};

type ClevelandItemResponse = {
  data: ClevelandArtwork;
};

function toPositiveNumber(value: string | number | null | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function toDisplayText(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const joined = value
      .map((item) => toDisplayText(item))
      .filter(Boolean)
      .join(", ");
    return joined || null;
  }
  return null;
}

function formatUnframedFromObject(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const dims = value as Record<string, unknown>;
  const heightM = toPositiveNumber(dims.height as string | number | null | undefined);
  const widthM = toPositiveNumber(dims.width as string | number | null | undefined);
  const depthM = toPositiveNumber(dims.depth as string | number | null | undefined);
  if (!heightM && !widthM) {
    return null;
  }
  const parts = [heightM, widthM, depthM]
    .filter((n): n is number => n != null)
    .map((meters) => {
      const cm = meters * 100;
      return Number.isInteger(cm) ? String(cm) : cm.toFixed(1).replace(/\.0$/, "");
    });
  return parts.length ? `${parts.join(" x ")} cm` : null;
}

/** Quita el bloque en pulgadas: "76.2 x 64.8 cm (30 x 25 1/2 in.)" → "76.2 x 64.8 cm" */
function toCentimetersOnly(value: string): string {
  return value
    .replace(/\s*\([^)]*\bin\.?\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function mapDimensions(item: ClevelandArtwork): string | null {
  const measurements = toDisplayText(item.measurements);
  if (measurements) {
    const unframed = measurements
      .match(/(?:^|;\s*)Unframed:\s*([^;]+)/i)?.[1]
      ?.trim();
    if (unframed) {
      return toCentimetersOnly(unframed);
    }
  }

  if (
    item.dimensions &&
    typeof item.dimensions === "object" &&
    !Array.isArray(item.dimensions)
  ) {
    const fromObject = formatUnframedFromObject(
      (item.dimensions as Record<string, unknown>).unframed,
    );
    if (fromObject) {
      return fromObject;
    }
  }

  // Sin unframed (Overall, Sheet, etc.): mostrar la medida disponible.
  const fallback = measurements ?? toDisplayText(item.dimensions);
  return fallback ? toCentimetersOnly(fallback) : null;
}

function mapSummary(item: ClevelandArtwork): ArtworkSummary {
  const web = item.images?.web;
  return {
    id: item.id,
    title: item.title?.trim() || "Sin título",
    artist_display: item.creators?.[0]?.description ?? null,
    image_url: web?.url ?? null,
    image_width: toPositiveNumber(web?.width),
    image_height: toPositiveNumber(web?.height),
    date_display: item.date_text || item.creation_date || null,
    classification_title: item.type ?? null,
    is_public_domain: item.share_license_status === "CC0",
  };
}

function mapProvenanceSummary(
  provenance: ClevelandProvenance[] | null | undefined,
): string | null {
  if (!provenance?.length) {
    return null;
  }
  const lines = provenance
    .map((entry) => toDisplayText(entry.description))
    .filter((line): line is string => Boolean(line));
  if (!lines.length) {
    return null;
  }
  // Últimas entradas suelen ser las más relevantes / recientes.
  return lines.slice(0, 3).join("\n");
}

function mapDetail(item: ClevelandArtwork): ArtworkDetail {
  return {
    ...mapSummary(item),
    medium_display: toDisplayText(item.technique),
    place_of_origin: toDisplayText(item.culture),
    dimensions: mapDimensions(item),
    department_title: toDisplayText(item.department),
    description:
      toDisplayText(item.description) || toDisplayText(item.wall_description),
    credit_line: toDisplayText(item.creditline),
    accession_number: toDisplayText(item.accession_number),
    current_location: toDisplayText(item.current_location),
    collection_title: toDisplayText(item.collection),
    did_you_know: toDisplayText(item.did_you_know),
    artist_biography: toDisplayText(item.creators?.[0]?.biography),
    provenance_summary: mapProvenanceSummary(item.provenance),
    museum_url: toDisplayText(item.url),
  };
}

function toPagination(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    limit,
    offset: (page - 1) * limit,
    total_pages: totalPages,
    current_page: page,
  };
}

function buildListQuery(page: number, filters: ArtworkFilters = {}) {
  return {
    has_image: 1,
    limit: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    title: filters.q?.trim() || undefined,
    artists: filters.artist?.trim() || undefined,
    type: filters.classification || undefined,
    cc0: filters.publicDomainOnly ? 1 : undefined,
  };
}

export async function fetchArtworksPage(
  page: number,
  filters: ArtworkFilters = {},
  signal?: AbortSignal,
): Promise<ArtworkListResponse> {
  const response = await apiRequest<ClevelandListResponse>({
    path: "/artworks/",
    query: buildListQuery(page, filters),
    signal,
  });

  return {
    data: response.data.map(mapSummary),
    pagination: toPagination(response.info.total, page, PAGE_SIZE),
  };
}

export async function fetchArtworkById(
  id: number,
  signal?: AbortSignal,
): Promise<ArtworkItemResponse> {
  const response = await apiRequest<ClevelandItemResponse>({
    path: `/artworks/${id}`,
    signal,
  });

  return {
    data: mapDetail(response.data),
  };
}

export function getArtworkImageUrl(
  imageUrl: string | null | undefined,
  _size?: 200 | 843,
) {
  return imageUrl ?? null;
}

/** Prefiere cache local (offline) y cae al URL remoto. */
export function resolveArtworkImageUrl(
  artwork: Pick<ArtworkSummary, "image_url" | "cached_image_uri">,
  size?: 200 | 843,
) {
  if (artwork.cached_image_uri) {
    return artwork.cached_image_uri;
  }
  return getArtworkImageUrl(artwork.image_url, size);
}

export { PAGE_SIZE };
