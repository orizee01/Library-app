"use client";

import { useActionState } from "react";
import { addBook, type BookValues } from "./actions";

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900";
const primaryButton =
  "rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50";

export function Message({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="mt-2 text-sm font-medium text-red-700">
      {text}
    </p>
  );
}

function BookFields({ values }: { values?: Partial<BookValues> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
      <label className="text-sm font-medium text-stone-700">
        Title
        <input name="title" defaultValue={values?.title} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm font-medium text-stone-700">
        Author
        <input name="author" defaultValue={values?.author} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm font-medium text-stone-700">
        Year
        <input
          name="year"
          inputMode="numeric"
          defaultValue={values?.year}
          className={`${inputClass} mt-1`}
        />
      </label>
    </div>
  );
}

export function AddBookForm() {
  const [state, action, pending] = useActionState(addBook, {});
  return (
    <form action={action} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-stone-900">Add a book</h3>
      <BookFields values={state.values} />
      <Message text={state.error} />
      <button type="submit" disabled={pending} className={`${primaryButton} mt-3`}>
        {pending ? "Adding…" : "Add book"}
      </button>
    </form>
  );
}
