"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/db";
import { endSession, hashPassword, startSession, verifyPassword } from "@/lib/auth";
import {
  readLogin,
  readSignup,
  validateLogin,
  validateSignup,
  type FieldErrors,
} from "@/lib/auth-validation";
import { JUST_LOGGED_IN_COOKIE } from "@/lib/session-cookie";

export type AuthFormState = {
  error?: string; // about the whole form
  fieldErrors?: FieldErrors; // about one field, keyed by its input name
  values?: { name?: string; email: string };
};

const TRY_AGAIN = "Something went wrong. Please try again.";
const WRONG_LOGIN = "That email or password is incorrect.";
const MAX_PASSWORD_LENGTH = 200;

// Checked against when the email is unknown, so a wrong email takes as long as
// a wrong password and doesn't reveal who has an account.
const NO_SUCH_USER = `${"0".repeat(32)}$${"0".repeat(128)}`;

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { name, email, password } = readSignup(formData);
  const values = { name, email }; // the password is never sent back

  const fieldErrors = validateSignup(formData);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  try {
    const [user] = await sql<{ id: number }[]>`
      insert into users (name, email, password_hash)
      values (${name}, ${email}, ${await hashPassword(password)})
      on conflict (lower(email)) do nothing
      returning id
    `;
    if (!user) {
      return {
        fieldErrors: { email: "That email already has an account. Please log in instead." },
        values,
      };
    }
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN, values };
  }

  redirect("/login?created=1");
}

export async function logIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readLogin(formData);
  const values = { email };

  const fieldErrors = validateLogin(formData);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };
  if (password.length > MAX_PASSWORD_LENGTH) return { error: WRONG_LOGIN, values };

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
