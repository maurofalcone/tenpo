let pendingHref: string | null = null;

export function setPendingHref(href: string | null) {
  pendingHref = href;
}

export function consumePendingHref(): string | null {
  const href = pendingHref;
  pendingHref = null;
  return href;
}

export function peekPendingHref(): string | null {
  return pendingHref;
}
