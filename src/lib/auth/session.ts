import {
  clearSession,
  loadSession,
  saveSession,
} from "./sessionStorage";
import {
  createSession,
  isExpired,
  refreshSession,
  type Session,
} from "./tokens";

const ACCESS_SKEW_MS = 15_000;
const LOGIN_DELAY_MS = 800;
const REFRESH_DELAY_MS = 300;

export class SessionExpiredError extends Error {
  constructor(message = "Tu sesión venció. Volvé a entrar.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

type SessionListener = (session: Session | null) => void;

let memorySession: Session | null = null;
let refreshPromise: Promise<string> | null = null;
const listeners = new Set<SessionListener>();

function emit(session: Session | null) {
  memorySession = session;
  listeners.forEach((listener) => listener(session));
}

export function subscribeSession(listener: SessionListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMemorySession() {
  return memorySession;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function hydrateSession(): Promise<Session | null> {
  const stored = await loadSession();
  if (!stored) {
    emit(null);
    return null;
  }

  if (!isExpired(stored.accessTokenExpiresAt, Date.now(), ACCESS_SKEW_MS)) {
    emit(stored);
    return stored;
  }

  if (!isExpired(stored.refreshTokenExpiresAt)) {
    memorySession = stored;
    try {
      await getValidAccessToken();
      return memorySession;
    } catch {
      await clearSession();
      emit(null);
      return null;
    }
  }

  await clearSession();
  emit(null);
  return null;
}

export async function login(email: string, _password: string): Promise<Session> {
  await wait(LOGIN_DELAY_MS);
  const session = createSession(email.trim().toLowerCase());
  await saveSession(session);
  emit(session);
  return session;
}

export async function logout(): Promise<void> {
  await clearSession();
  emit(null);
}

async function performRefresh(session: Session): Promise<string> {
  await wait(REFRESH_DELAY_MS);

  if (isExpired(session.refreshTokenExpiresAt)) {
    await clearSession();
    emit(null);
    throw new SessionExpiredError();
  }

  const next = refreshSession(session);
  await saveSession(next);
  emit(next);
  return next.accessToken;
}

export async function getValidAccessToken(): Promise<string> {
  const session = memorySession ?? (await loadSession());
  if (!session) {
    throw new SessionExpiredError();
  }

  memorySession = session;

  if (!isExpired(session.accessTokenExpiresAt, Date.now(), ACCESS_SKEW_MS)) {
    return session.accessToken;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = performRefresh(session).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
