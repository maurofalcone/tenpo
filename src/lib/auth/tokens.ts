function toBase64(value: string) {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let i = 0;

  while (i < value.length) {
    const a = value.charCodeAt(i++);
    const b = i < value.length ? value.charCodeAt(i++) : Number.NaN;
    const c = i < value.length ? value.charCodeAt(i++) : Number.NaN;

    const bitmap =
      (a << 16) | ((Number.isNaN(b) ? 0 : b) << 8) | (Number.isNaN(c) ? 0 : c);

    output += chars.charAt((bitmap >> 18) & 63);
    output += chars.charAt((bitmap >> 12) & 63);
    output += Number.isNaN(b)
      ? "="
      : chars.charAt((bitmap >> 6) & 63);
    output += Number.isNaN(c) ? "=" : chars.charAt(bitmap & 63);
  }

  return output;
}

function fromBase64(value: string) {
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(value);
  }

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const str = value.replace(/=+$/, "");
  let output = "";

  for (let i = 0; i < str.length; i += 4) {
    const enc1 = chars.indexOf(str.charAt(i));
    const enc2 = chars.indexOf(str.charAt(i + 1));
    const enc3 = chars.indexOf(str.charAt(i + 2));
    const enc4 = chars.indexOf(str.charAt(i + 3));

    const bitmap = (enc1 << 18) | (enc2 << 12) | (enc3 << 6) | enc4;

    output += String.fromCharCode((bitmap >> 16) & 255);
    if (enc3 !== 64 && !Number.isNaN(enc3) && str.charAt(i + 2) !== "") {
      output += String.fromCharCode((bitmap >> 8) & 255);
    }
    if (enc4 !== 64 && !Number.isNaN(enc4) && str.charAt(i + 3) !== "") {
      output += String.fromCharCode(bitmap & 255);
    }
  }

  return output;
}

export type Session = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  email: string;
};

export type TokenPayload = {
  sub: string;
  exp: number;
  typ: "access" | "refresh";
};

const ACCESS_TTL_MS = 2 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function encodePayload(payload: TokenPayload): string {
  const json = JSON.stringify(payload);
  return `fake.${toBase64(json)}.sig`;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== "fake") {
      return null;
    }
    return JSON.parse(fromBase64(parts[1])) as TokenPayload;
  } catch {
    return null;
  }
}

export function createSession(email: string, now = Date.now()): Session {
  const accessTokenExpiresAt = now + ACCESS_TTL_MS;
  const refreshTokenExpiresAt = now + REFRESH_TTL_MS;

  return {
    email,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    accessToken: encodePayload({
      sub: email,
      exp: accessTokenExpiresAt,
      typ: "access",
    }),
    refreshToken: encodePayload({
      sub: email,
      exp: refreshTokenExpiresAt,
      typ: "refresh",
    }),
  };
}

export function refreshSession(session: Session, now = Date.now()): Session {
  const accessTokenExpiresAt = now + ACCESS_TTL_MS;
  const refreshTokenExpiresAt = now + REFRESH_TTL_MS;

  return {
    ...session,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    accessToken: encodePayload({
      sub: session.email,
      exp: accessTokenExpiresAt,
      typ: "access",
    }),
    refreshToken: encodePayload({
      sub: session.email,
      exp: refreshTokenExpiresAt,
      typ: "refresh",
    }),
  };
}

export function isExpired(expiresAt: number, now = Date.now(), skewMs = 0) {
  return now + skewMs >= expiresAt;
}
