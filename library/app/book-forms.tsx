"use client";

import { useActionState, useState, useTransition } from "react";
import type { Book } from "@/db/books";
import type { Member } from "@/db/members";
import {
  addBook,
  deleteBook,
  lendBook,
  returnBook,
  updateBook,
  type BookValues,
} from "./actions";

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900";
const primaryButton =
  "rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50";
const plainButton =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50";
const dangerButton =
  "rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50";

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

function EditBookForm({ book, onClose }: { book: Book; onClose: () => void }) {
  const [state, action, pending] = useActionState(
    async (previous: Parameters<typeof updateBook>[0], formData: FormData) => {
      const result = await updateBook(previous, formData);
      if (!result.error) onClose();
      return result;
    },
    {},
  );
  const values = state.values ?? {
    title: book.title,
    author: book.author,
    year: book.year?.toString() ?? "",
  };

  return (
    <form action={action} className="mt-3 border-t border-stone-200 pt-3">
      <input type="hidden" name="id" value={book.id} />
      <BookFields values={values} />
      <Message text={state.error} />
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onClose} className={plainButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// The buttons on one book. They share one message, so a new attempt clears the
// last message.
export function BookActions({ book, members }: { book: Book; members: Member[] }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function run(action: (formData: FormData) => Promise<{ error?: string }>) {
    return (formData: FormData) =>
      startTransition(async () => {
        const result = await action(formData);
        setMessage(result.error);
      });
  }

  return (
    <div className="mt-3">
      {book.due_on ? (
        <form action={run(returnBook)} className="mb-2">
          <input type="hidden" name="id" value={book.id} />
          <button type="submit" disabled={pending} className={primaryButton}>
            Record return
          </button>
        </form>
      ) : (
        <form action={run(lendBook)} className="mb-2 flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={book.id} />
          <select
            name="member_id"
            aria-label={`Lend "${book.title}" to`}
            defaultValue=""
            className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 sm:max-w-xs"
          >
            <option value="" disabled>
              Choose a member…
            </option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={pending} className={primaryButton}>
            Lend for 14 days
          </button>
        </form>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setEditing(!editing);
            setMessage(undefined);
          }}
          className={plainButton}
        >
          Edit
        </button>
        <form
          action={run(deleteBook)}
          onSubmit={(event) => {
            if (!window.confirm(`Delete "${book.title}"?`)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={book.id} />
          <button type="submit" disabled={pending} className={dangerButton}>
            Delete
          </button>
        </form>
      </div>
      <Message text={message} />
      {editing && <EditBookForm book={book} onClose={() => setEditing(false)} />}
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
