import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { ArtworkDetail } from "@/lib/api/types";
import { wrapRichHtml } from "@/lib/html/museum";
import { colors } from "@/theme/colors";
import { createArtworkDeepLink } from "./share";

/** Paleta fija del PDF (siempre light; no depende del tema de la app). */
const pdf = {
  text: colors.light.text,
  muted: colors.light.muted,
  border: colors.light.border,
  bg: colors.light.bg,
  inkSoft: colors.inkSoft,
  inkBody: colors.inkBody,
  empty: colors.dark.muted,
} as const;

/** Base64 enorme puede tumbar el WebView de print en Android. */
const MAX_PDF_IMAGE_BASE64_IOS = 1_800_000;
const MAX_PDF_IMAGE_BASE64_ANDROID = 700_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "obra"
  );
}

function row(label: string, value?: string | null): string {
  if (!value?.trim()) {
    return "";
  }
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value.trim())}</td></tr>`;
}

async function fileToDataUri(uri: string): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const max =
      Platform.OS === "android"
        ? MAX_PDF_IMAGE_BASE64_ANDROID
        : MAX_PDF_IMAGE_BASE64_IOS;
    if (!base64 || base64.length > max) {
      return null;
    }
    const lower = uri.toLowerCase();
    const mime = lower.endsWith(".png")
      ? "image/png"
      : lower.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

/**
 * expo-print (sobre todo Android) no carga bien URLs remotas en el HTML:
 * bajamos la imagen y la inlinamos en base64.
 */
async function resolveImageSrc(
  artwork: Pick<ArtworkDetail, "id" | "image_url" | "cached_image_uri">,
): Promise<string | null> {
  const local = artwork.cached_image_uri;
  if (local) {
    const fromCache = await fileToDataUri(local);
    if (fromCache) {
      return fromCache;
    }
  }

  const remote = artwork.image_url?.trim();
  if (!remote?.startsWith("http")) {
    return null;
  }

  try {
    const target = `${FileSystem.cacheDirectory}pdf-art-${artwork.id}.img`;
    const downloaded = await FileSystem.downloadAsync(remote, target);
    return await fileToDataUri(downloaded.uri);
  } catch {
    return null;
  }
}

/** US Letter @ 72 PPI (Expo Print). */
const LETTER_WIDTH = 612;
const LETTER_HEIGHT = 792;
/** ~0.7" de sangría / margen de página. */
const PAGE_MARGIN = 50;

export function buildArtworkPdfHtml(
  artwork: ArtworkDetail,
  imageSrc: string | null,
  options?: { compact?: boolean },
): string {
  const compact = Boolean(options?.compact);
  const title = artwork.title?.trim() || "Sin título";
  const deepLink = createArtworkDeepLink(artwork.id);
  // No pasar data: URIs por escapeHtml (rompe el src).
  const safeImageSrc = imageSrc?.replace(/"/g, "") ?? null;
  const imageBlock = safeImageSrc
    ? `<img class="hero" src="${safeImageSrc}" alt="${escapeHtml(title)}" />`
    : `<div class="placeholder">Sin imagen</div>`;

  const metaRows = [
    row("Artista", artwork.artist_display),
    row("Fecha", artwork.date_display),
    row("Clasificación", artwork.classification_title),
    row("Medio", artwork.medium_display),
    row("Dimensiones", artwork.dimensions),
    row("Origen", artwork.place_of_origin),
    row("Departamento", artwork.department_title),
    row("Colección", artwork.collection_title),
    row("Ubicación", artwork.current_location),
    row("Accesión", artwork.accession_number),
    row("Crédito", artwork.credit_line),
  ].join("");

  const descriptionHtml = artwork.description?.trim()
    ? wrapRichHtml(artwork.description)
    : "";
  const descriptionBlock = descriptionHtml
    ? `<h2>Descripción</h2><div class="rich">${descriptionHtml}</div>`
    : `<h2>Descripción</h2><p class="empty">Sin descripción disponible.</p>`;

  const gridCss = compact
    ? `
    .grid { display: block; width: 100%; }
    .col { display: block; width: 100%; }
    .col-left { padding-right: 0; }
    .col-right {
      padding-left: 0;
      margin-top: 12px;
      border-left: 0;
      border-top: 1px solid ${pdf.border};
      padding-top: 10px;
    }`
    : `
    .grid {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
    .col {
      display: table-cell;
      vertical-align: top;
    }
    .col-left {
      width: 50%;
      padding-right: 14px;
    }
    .col-right {
      width: 50%;
      padding-left: 14px;
      border-left: 1px solid ${pdf.border};
    }`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @page {
      ${compact ? "" : "size: letter;"}
      margin: ${PAGE_MARGIN}pt;
    }
    * { box-sizing: border-box; }
    body {
      font-family: Helvetica, Arial, sans-serif;
      color: ${pdf.text};
      margin: 0;
      padding: 0;
      font-size: 11px;
    }
    .brand {
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${pdf.muted};
      margin-bottom: 8px;
    }
    h1 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px;
      line-height: 1.2;
    }
    .artist {
      font-size: 12px;
      color: ${pdf.inkSoft};
      margin: 0 0 12px;
    }
    ${gridCss}
    .hero {
      display: block;
      width: 100%;
      max-height: ${compact ? "160px" : "210px"};
      object-fit: contain;
      background: ${pdf.bg};
      border-radius: 6px;
      margin: 0 0 10px;
    }
    .placeholder {
      height: 120px;
      text-align: center;
      background: ${pdf.bg};
      color: ${pdf.muted};
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 11px;
      padding-top: 48px;
    }
    table.meta {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      margin: 0;
      border: 0;
    }
    table.meta tr + tr {
      border-top: 1px solid ${pdf.border};
    }
    table.meta th,
    table.meta td {
      text-align: left;
      vertical-align: top;
      padding: 4px 0;
      border: 0;
      font-size: 9.5px;
      line-height: 1.3;
    }
    table.meta th {
      width: 38%;
      color: ${pdf.muted};
      font-weight: 500;
      padding-right: 8px;
    }
    h2 {
      font-size: 11px;
      margin: 0 0 8px;
      letter-spacing: 0.02em;
    }
    .rich {
      font-size: 9.5px;
      line-height: 1.4;
      color: ${pdf.inkBody};
    }
    .rich p {
      margin: 0 0 6px;
    }
    .rich p:last-child {
      margin-bottom: 0;
    }
    .rich em, .rich i {
      font-style: italic;
    }
    .rich strong, .rich b {
      font-weight: 600;
    }
    .rich a {
      color: ${pdf.text};
      text-decoration: underline;
    }
    .rich hr {
      display: none;
    }
    .empty {
      margin: 0;
      color: ${pdf.empty};
      font-size: 10px;
    }
    .footer {
      margin-top: 10px;
      font-size: 9px;
      color: ${pdf.empty};
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="brand">Tenpo Gallery · Cleveland Museum of Art</div>
  <h1>${escapeHtml(title)}</h1>
  <p class="artist">${escapeHtml(artwork.artist_display?.trim() || "Artista desconocido")}</p>
  <div class="grid">
    <div class="col col-left">
      ${imageBlock}
      ${metaRows ? `<table class="meta">${metaRows}</table>` : ""}
    </div>
    <div class="col col-right">
      ${descriptionBlock}
    </div>
  </div>
  <div class="footer">Deep link: ${escapeHtml(deepLink)}</div>
</body>
</html>`;
}

function pdfCachePath(artwork: Pick<ArtworkDetail, "id" | "title">): string {
  const filename = `tenpo-${slugify(artwork.title || "obra")}-${artwork.id}.pdf`;
  return `${FileSystem.cacheDirectory}${filename}`;
}

async function sharePdf(uri: string, title?: string | null): Promise<void> {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: title || "Imprimir",
      });
      return;
    }
  } catch {
    // Emulador / sin apps de share: caemos al print nativo.
  }

  await Print.printAsync({ uri });
}

async function printHtmlToFile(
  artwork: ArtworkDetail,
  imageSrc: string | null,
): Promise<string> {
  const compact = Platform.OS === "android";
  const html = buildArtworkPdfHtml(artwork, imageSrc, { compact });
  const printOptions: Print.FilePrintOptions = { html };

  // width/height custom a veces rompe el WebView print de Android.
  if (Platform.OS === "ios") {
    printOptions.width = LETTER_WIDTH;
    printOptions.height = LETTER_HEIGHT;
    printOptions.margins = {
      top: PAGE_MARGIN,
      right: PAGE_MARGIN,
      bottom: PAGE_MARGIN,
      left: PAGE_MARGIN,
    };
  }

  const { uri } = await Print.printToFileAsync(printOptions);
  return uri;
}

export async function exportArtworkPdf(
  artwork: ArtworkDetail,
): Promise<void> {
  const destination = pdfCachePath(artwork);
  const cached = await FileSystem.getInfoAsync(destination);
  if (cached.exists) {
    await sharePdf(destination, artwork.title);
    return;
  }

  const imageSrc = await resolveImageSrc(artwork);

  let uri: string;
  try {
    uri = await printHtmlToFile(artwork, imageSrc);
  } catch (error) {
    // Reintento sin imagen (HTML más liviano) — común en Android/emulador.
    if (imageSrc) {
      uri = await printHtmlToFile(artwork, null);
    } else {
      throw error;
    }
  }

  try {
    const existing = await FileSystem.getInfoAsync(destination);
    if (existing.exists) {
      await FileSystem.deleteAsync(destination, { idempotent: true });
    }
    await FileSystem.moveAsync({ from: uri, to: destination });
    await sharePdf(destination, artwork.title);
  } catch {
    try {
      await FileSystem.copyAsync({ from: uri, to: destination });
      await sharePdf(destination, artwork.title);
    } catch {
      await sharePdf(uri, artwork.title);
    }
  }
}
