"use client";

import Link from "next/link";
import { useActionState, useId, useState, type ChangeEvent, type SyntheticEvent } from "react";
import { validateLogin, validateSignup, type FieldErrors } from "@/lib/auth-validation";
import { logIn, signUp } from "./auth-actions";

const invalidField = "aria-invalid:border-oxblood aria-invalid:ring-1 aria-invalid:ring-oxblood/30";

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

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-semibold text-oxblood-deep">
      {text}
    </p>
  );
}

function TextField({
  label,
  name,
  error,
  type,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  error?: string;
  type?: string;
  autoComplete: string;
  defaultValue?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`field ${invalidField}`}
      />
      <FieldError id={errorId} text={error} />
    </div>
  );
}

// The button sits outside the label, so clicking it doesn't focus the field, and
// type="button" stops it submitting the form.
function PasswordField({
  autoComplete,
  error,
  hint,
}: {
  autoComplete: string;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="field-label">
        Password
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={`field mt-0 pr-11 ${invalidField}`}
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
      {hint && (
        <p id={hintId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId} text={error} />
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

// Combines the browser's checks with whatever the server last reported. A form
// with a problem isn't sent, so a password that's already typed stays in the box.
// Editing a field clears its message until the next submit.
function useFieldErrors(validate: (formData: FormData) => FieldErrors, fromServer?: FieldErrors) {
  const [fromBrowser, setFromBrowser] = useState<FieldErrors>({});
  const [edited, setEdited] = useState<string[]>([]);

  const errors: FieldErrors = { ...fromServer, ...fromBrowser };
  for (const name of edited) delete errors[name];

  function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const found = validate(new FormData(form));
    setFromBrowser(found);
    setEdited([]);
    const first = Object.keys(found)[0];
    if (first) {
      event.preventDefault();
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
    }
  }

  function onChange(event: ChangeEvent<HTMLFormElement>) {
    const { name } = event.target as unknown as HTMLInputElement;
    if (name) setEdited((names) => (names.includes(name) ? names : [...names, name]));
    setFromBrowser((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  return { errors, blocked: Object.keys(fromBrowser).length > 0, onSubmit, onChange };
}

// noValidate: these forms explain problems themselves, in the app's own words.
export function LoginForm() {
  const [state, action, pending] = useActionState(logIn, {});
  const { errors, blocked, onSubmit, onChange } = useFieldErrors(validateLogin, state.fieldErrors);
  return (
    <form
      action={action}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="card card-ruled p-6"
    >
      <div className="grid gap-3">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          error={errors.email}
        />
        <PasswordField autoComplete="current-password" error={errors.password} />
      </div>
      <Alert text={blocked ? undefined : state.error} />
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
  const { errors, blocked, onSubmit, onChange } = useFieldErrors(validateSignup, state.fieldErrors);
  return (
    <form
      action={action}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="card card-ruled p-6"
    >
      <div className="grid gap-3">
        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          defaultValue={state.values?.name}
          error={errors.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          error={errors.email}
        />
        <PasswordField
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password}
        />
        <TextField
          label="Invite code"
          name="invite_code"
          autoComplete="off"
          defaultValue={state.values?.inviteCode}
          error={errors.invite_code}
        />
      </div>
      <Alert text={blocked ? undefined : state.error} />
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
