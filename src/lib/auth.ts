import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";

const COOKIE = "pta_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret";
}

/** Password hash stored in the DB. Keep in sync with scripts/seed.mjs. */
export function hashPassword(password: string): string {
  return createHmac("sha256", secret()).update(password).digest("hex");
}

/** Opaque session signature bound to the user's current password hash. */
function sessionSig(userId: number, passwordHash: string): string {
  return createHmac("sha256", secret())
    .update(`${userId}:${passwordHash}`)
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return false;

  const [idStr, sig] = raw.split(".");
  const id = Number(idStr);
  if (!Number.isInteger(id) || !sig) return false;

  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const user = rows[0];
  if (!user) return false;

  return safeEqual(sig, sessionSig(user.id, user.passwordHash));
}

/** Throws when the caller isn't logged in. Used to gate mutating actions. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) {
    throw new Error("Not authorized — please log in to edit.");
  }
}

/** Validates credentials against the DB and sets the session cookie. */
export async function login(
  username: string,
  password: string,
): Promise<boolean> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  const user = rows[0];
  if (!user) return false;
  if (!safeEqual(user.passwordHash, hashPassword(password))) return false;

  const store = await cookies();
  store.set(COOKIE, `${user.id}.${sessionSig(user.id, user.passwordHash)}`, {
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
