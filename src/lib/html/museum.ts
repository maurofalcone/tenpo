/** Sanitiza HTML liviano del museo (em/i/strong/p/br/a…). */
export function sanitizeMuseumHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/** Envuelve texto plano en <p> si no parece HTML de bloque. */
export function wrapRichHtml(html: string): string {
  const trimmed = sanitizeMuseumHtml(html);
  if (!trimmed) {
    return "";
  }
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }
  return `<p>${trimmed}</p>`;
}
