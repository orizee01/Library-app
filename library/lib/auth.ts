import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { sql } from "@/db";
import { SESSION_COOKIE } from "./session-cookie";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  length: number,
) => Promise<Buffer>;

const SESSION_DAYS = 30;
const KEY_LENGTH = 64;

// A random salt means two people with the same password get different hashes.
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, keyHex] = stored.split("$");
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scryptAsync(password, salt, KEY_LENGTH);
  return timingSafeEqual(actual, expected);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// Logs this browser in: stores a hash of a random token, and gives the browser
// the token in a cookie its JavaScript can't read.
export async function startSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await sql`delete from sessions where expires_at < now()`;
  await sql`
    insert into sessions (token_hash, user_id, expires_at)
    values (${hashToken(token)}, ${userId}, ${expires})
  `;

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await sql`delete from sessions where token_hash = ${hashToken(token)}`;
  }
  cookieStore.delete(SESSION_COOKIE);
}

// The logged-in user, or null. cache() means one lookup per request, however
// many components ask.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [user] = await sql<{ id: number; name: string }[]>`
    select u.id, u.name
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()
  `;
  return user ?? null;
});

// Every page and server action that needs a login calls this first.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
