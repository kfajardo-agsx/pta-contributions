import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "pta_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function creds() {
  return {
    username: process.env.APP_USERNAME ?? "admin",
    password: process.env.APP_PASSWORD ?? "changeme",
    secret: process.env.AUTH_SECRET ?? "dev-insecure-secret",
  };
}

// An opaque token derived from the credentials. Storing this (not the password)
// in the cookie means a stolen cookie can't reveal the password, and changing
// any credential invalidates existing sessions.
function expectedToken() {
  const { username, password, secret } = creds();
  return createHmac("sha256", secret)
    .update(`${username}:${password}`)
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, expectedToken());
}

/** Throws when the caller isn't logged in. Used to gate mutating actions. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) {
    throw new Error("Not authorized — please log in to edit.");
  }
}

/** Validates credentials (from env) and sets the session cookie. */
export async function login(
  username: string,
  password: string,
): Promise<boolean> {
  const c = creds();
  if (username !== c.username || password !== c.password) return false;

  const store = await cookies();
  store.set(COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return true;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
