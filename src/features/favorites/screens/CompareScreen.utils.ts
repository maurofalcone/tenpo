export const MAX_COMPARE = 4;

export function parseCompareIds(raw: string | string[] | undefined): number[] {
  const value = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  const ids = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
  return [...new Set(ids)].slice(0, MAX_COMPARE);
}
