"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/db";
import { endSession, hashPassword, startSession, verifyPassword } from "@/lib/auth";
import { JUST_LOGGED_IN_COOKIE } from "@/lib/session-cookie";

export type AuthFormState = { error?: string; values?: { name?: string; email: string } };

const TRY_AGAIN = "Something went wrong. Please try again.";
const WRONG_LOGIN = "That email or password is incorrect.";

// Checked against when the email is unknown, so a wrong email takes as long as
// a wrong password and doesn't reveal who has an account.
const NO_SUCH_USER = `${"0".repeat(32)}$${"0".repeat(128)}`;

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readEmail(formData: FormData) {
  return field(formData, "email").trim().toLowerCase();
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = field(formData, "name").trim().replace(/\s+/g, " ");
  const email = readEmail(formData);
  const password = field(formData, "password");
  const values = { name, email }; // the password is never sent back

  if (!name) return { error: "Please enter your name.", values };
  if (name.length > 200) return { error: "That name is too long (200 characters at most).", values };
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a real email address.", values };
  }
  if (password.length < 8) return { error: "Your password needs at least 8 characters.", values };
  if (password.length > 200) {
    return { error: "That password is too long (200 characters at most).", values };
  }

  try {
    const [user] = await sql<{ id: number }[]>`
      insert into users (name, email, password_hash)
      values (${name}, ${email}, ${await hashPassword(password)})
      on conflict (lower(email)) do nothing
      returning id
    `;
    if (!user) {
      return { error: "That email already has an account. Please log in instead.", values };
    }
    await startSession(user.id);
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN, values };
  }

  redirect("/");
}

export async function logIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readEmail(formData);
  const password = field(formData, "password");
  const values = { email };

  if (!email || !password) return { error: "Please enter your email and password.", values };
  if (password.length > 200) return { error: WRONG_LOGIN, values };

  try {
    const [user] = await sql<{ id: number; password_hash: string }[]>`
      select id, password_hash from users where lower(email) = ${email}
    `;
    const correct = await verifyPassword(password, user?.password_hash ?? NO_SUCH_USER);
    if (!user || !correct) return { error: WRONG_LOGIN, values };
    await startSession(user.id);
    (await cookies()).set(JUST_LOGGED_IN_COOKIE, "1", { path: "/", maxAge: 60, sameSite: "lax" });
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN, values };
  }

  redirect("/");
}

export async function logOut() {
  await endSession();
  redirect("/login");
}
