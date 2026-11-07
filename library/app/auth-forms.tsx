"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { logIn, signUp } from "./auth-actions";

// An open eye means "click to show"; a crossed-out eye means "click to hide".
function EyeIcon({ crossedOut }: { crossedOut: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {crossedOut && <path d="M4 4l16 16" />}
    </svg>
  );
}

// The button sits outside the label, so clicking it doesn't focus the field, and
// type="button" stops it submitting the form.
function PasswordField({ label, autoComplete }: { label: string; autoComplete: string }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className="field mt-0 pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-sm text-muted transition-colors hover:text-moss focus-visible:ring-2 focus-visible:ring-moss focus-visible:outline-none"
        >
          <EyeIcon crossedOut={visible} />
        </button>
      </div>
    </div>
  );
}

function Alert({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="alert">
      {text}
    </p>
  );
}

// noValidate: the server checks everything and explains problems the same way
// as the rest of the app.
export function LoginForm() {
  const [state, action, pending] = useActionState(logIn, {});
  return (
    <form action={action} noValidate className="card card-ruled p-6">
      <div className="grid gap-3">
        <label className="field-label">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            className="field"
          />
        </label>
        <PasswordField label="Password" autoComplete="current-password" />
      </div>
      <Alert text={state.error} />
      <button type="submit" disabled={pending} className="btn-primary mt-4 w-full">
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-moss underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, {});
  return (
    <form action={action} noValidate className="card card-ruled p-6">
      <div className="grid gap-3">
        <label className="field-label">
          Name
          <input
            name="name"
            autoComplete="name"
            defaultValue={state.values?.name}
            className="field"
          />
        </label>
        <label className="field-label">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            className="field"
          />
        </label>
        <PasswordField label="Password (at least 8 characters)" autoComplete="new-password" />
      </div>
      <Alert text={state.error} />
      <button type="submit" disabled={pending} className="btn-primary mt-4 w-full">
        {pending ? "Creating account…" : "Sign up"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-moss underline underline-offset-2">
          Log in
        </Link>
      </p>
    </form>
  );
}
