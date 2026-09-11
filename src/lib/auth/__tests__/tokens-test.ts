import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createSession,
  decodeToken,
  isExpired,
  refreshSession,
} from "@/lib/auth/tokens";
import {
  loadSkipFavoritesDeleteConfirm,
  saveSkipFavoritesDeleteConfirm,
} from "@/lib/favorites/prefs";

describe("auth tokens", () => {
  it("creates access + refresh tokens for an email", () => {
    const now = 1_700_000_000_000;
    const session = createSession("demo@tenpo.cl", now);

    expect(session.email).toBe("demo@tenpo.cl");
    expect(session.accessTokenExpiresAt).toBe(now + 2 * 60 * 1000);
    expect(session.refreshTokenExpiresAt).toBe(now + 7 * 24 * 60 * 60 * 1000);

    const access = decodeToken(session.accessToken);
    const refresh = decodeToken(session.refreshToken);
    expect(access?.typ).toBe("access");
    expect(access?.sub).toBe("demo@tenpo.cl");
    expect(refresh?.typ).toBe("refresh");
  });

  it("marks tokens expired with skew", () => {
    const expiresAt = 1_000;
    expect(isExpired(expiresAt, 900)).toBe(false);
    expect(isExpired(expiresAt, 1_000)).toBe(true);
    expect(isExpired(expiresAt, 990, 15)).toBe(true);
  });

  it("refreshSession issues a new access token", () => {
    const base = createSession("a@b.com", 1_000);
    const next = refreshSession(base, 50_000);
    expect(next.email).toBe("a@b.com");
    expect(next.accessToken).not.toBe(base.accessToken);
    expect(next.accessTokenExpiresAt).toBe(50_000 + 2 * 60 * 1000);
  });
});

describe("favorites delete confirm pref", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("defaults to false and persists skip flag", async () => {
    expect(await loadSkipFavoritesDeleteConfirm()).toBe(false);
    await saveSkipFavoritesDeleteConfirm(true);
    expect(await loadSkipFavoritesDeleteConfirm()).toBe(true);
    await saveSkipFavoritesDeleteConfirm(false);
    expect(await loadSkipFavoritesDeleteConfirm()).toBe(false);
  });
});
