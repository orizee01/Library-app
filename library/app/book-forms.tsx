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
import { AddPanel } from "./add-panel";

export function Message({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="alert">
      {text}
    </p>
  );
}

function BookFields({
  values,
  layout,
}: {
  values?: Partial<BookValues>;
  layout: string;
}) {
  return (
    <div className={`grid gap-3 ${layout}`}>
      <label className="field-label">
        Title
        <input name="title" defaultValue={values?.title} className="field" />
      </label>
      <label className="field-label">
        Author
        <input
          name="author"
          list="known-authors"
          autoComplete="off"
          defaultValue={values?.author}
          className="field"
        />
      </label>
      <label className="field-label">
        Year
        <input name="year" inputMode="numeric" defaultValue={values?.year} className="field" />
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
    <form action={action} className="mt-4 border-t border-dashed border-line pt-4">
      <input type="hidden" name="id" value={book.id} />
      <BookFields values={values} layout="sm:grid-cols-[2fr_2fr_1fr]" />
      <Message text={state.error} />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onClose} className="btn-quiet">
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
    <div className="mt-4 border-t border-dashed border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        {book.due_on ? (
          <form action={run(returnBook)}>
            <input type="hidden" name="id" value={book.id} />
            <button type="submit" disabled={pending} className="btn-primary">
              Record return
            </button>
          </form>
        ) : (
          <form
            action={run(lendBook)}
            className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-1"
          >
            <input type="hidden" name="id" value={book.id} />
            <select
              name="member_id"
              aria-label={`Lend "${book.title}" to`}
              defaultValue=""
              className="field mt-0 basis-full sm:max-w-56 sm:flex-1 sm:basis-auto"
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
            <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
              Lend for 14 days
            </button>
          </form>
        )}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setEditing(!editing);
              setMessage(undefined);
            }}
            className="btn-quiet"
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
            <button type="submit" disabled={pending} className="btn-danger">
              Delete
            </button>
          </form>
        </div>
      </div>
      <Message text={message} />
      {editing && <EditBookForm book={book} onClose={() => setEditing(false)} />}
    </div>
  );
}

export function AddBookForm({ authors }: { authors: string[] }) {
  const [state, action, pending] = useActionState(addBook, {});
  return (
    <AddPanel label="Add a book">
      {/* Suggests authors we already have, in this form and every edit form,
          so a typing slip doesn't create a second copy of an author. */}
      <datalist id="known-authors">
        {authors.map((author) => (
          <option key={author} value={author} />
        ))}
      </datalist>
      <form action={action} className="card card-ruled p-5">
        <h3 className="mb-4 hidden font-display text-xl text-moss-deep lg:block">Add a book</h3>
        <BookFields values={state.values} layout="sm:grid-cols-[2fr_2fr_1fr] lg:grid-cols-1" />
        <Message text={state.error} />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary mt-4 w-full sm:w-auto lg:w-full"
        >
          {pending ? "Adding…" : "Add book"}
        </button>
      </form>
    </AddPanel>
  );
}
