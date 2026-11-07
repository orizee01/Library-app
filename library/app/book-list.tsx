"use client";

import Link from "next/link";
import { useState } from "react";
import type { Book } from "@/db/books";
import type { Member } from "@/db/members";
import { formatDate, matchesSearch } from "@/lib/format";
import { BookActions } from "./book-forms";

// Each book gets a binding colour, picked from its id so it never changes.
const bindings = [
  "bg-[#1f3d31]",
  "bg-[#7c2a23]",
  "bg-[#2f4a6b]",
  "bg-[#7a5a1c]",
  "bg-[#5b3d5e]",
  "bg-[#4d3320]",
];

// The first three letters of the author's surname, as on a library spine label.
function spineLabel(author: string) {
  return (author.trim().split(/\s+/).pop() ?? "").slice(0, 3).toUpperCase();
}

function BookCard({ book, members }: { book: Book; members: Member[] }) {
  return (
    <li className="card card-ruled p-4 sm:p-5">
      <div className="flex gap-4 sm:gap-5">
        <div
          aria-hidden="true"
          className={`relative flex h-28 w-12 shrink-0 flex-col items-center rounded-[2px] pt-3 shadow-[inset_-3px_0_4px_rgb(0_0_0/0.3),inset_2px_0_1px_rgb(255_255_255/0.12),0_2px_4px_rgb(60_40_15/0.35)] ${
            bindings[book.id % bindings.length]
          }`}
        >
          <span className="h-1.5 w-full border-y border-brass/70" />
          <span className="mt-2 font-display text-xl text-brass">
            {book.title.charAt(0).toUpperCase()}
          </span>
          <span className="absolute inset-x-1.5 bottom-2 rounded-[1px] bg-vellum py-0.5 text-center font-stamp text-[0.65rem] leading-tight font-bold text-ink">
            {spineLabel(book.author)}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-snug break-words text-moss-deep">
            {book.title}
          </h3>
          <p className="mt-1 text-base text-muted">
            {book.author}
            {book.year ? `, ${book.year}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className={`stamp ${book.due_on ? "stamp-out" : "stamp-in"}`}>
              {book.due_on
                ? `On loan to ${book.borrower}, due ${formatDate(book.due_on)}`
                : "Available"}
            </p>
            {book.overdue && <p className="stamp stamp-overdue">Overdue</p>}
          </div>
        </div>
      </div>
      <BookActions book={book} members={members} />
    </li>
  );
}

type Filter = "all" | "available" | "on-loan" | "overdue";

const filterTests: Record<Filter, (book: Book) => boolean> = {
  all: () => true,
  available: (book) => !book.due_on,
  "on-loan": (book) => Boolean(book.due_on),
  overdue: (book) => book.overdue,
};

const filterLabels: Record<Filter, string> = {
  all: "All",
  available: "Available",
  "on-loan": "On loan",
  overdue: "Overdue",
};

export function BookList({ books, members }: { books: Book[]; members: Member[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  if (books.length === 0) {
    return (
      <div className="card card-ruled p-10 text-center">
        <p className="font-display text-xl text-moss-deep">The shelves are empty</p>
        <p className="mt-1 text-muted">Add your first book to get started.</p>
      </div>
    );
  }

  const overdueCount = books.filter(filterTests.overdue).length;
  // The Overdue button only appears when there's something overdue, or while
  // it's selected, so the last overdue book coming back doesn't strand the view.
  const filters: Filter[] =
    overdueCount > 0 || filter === "overdue"
      ? ["all", "available", "on-loan", "overdue"]
      : ["all", "available", "on-loan"];

  const shown = books.filter(
    (book) =>
      filterTests[filter](book) &&
      matchesSearch(search, [book.title, book.author, book.year, book.borrower]),
  );

  return (
    <>
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by title, author, year or borrower"
        aria-label="Search books"
        className="field mt-0"
      />
      <div className="mt-3 mb-5 flex flex-wrap gap-2">
        {filters.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
            className={`chip ${name === "overdue" ? "chip-alert" : ""}`}
          >
            {filterLabels[name]} ({books.filter(filterTests[name]).length})
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-muted italic">
        Lending to someone new? Add them on the{" "}
        <Link href="/members" className="font-semibold text-moss underline underline-offset-2">
          Members
        </Link>{" "}
        page first.
      </p>
      {shown.length === 0 ? (
        <div className="card card-ruled p-10 text-center">
          <p className="font-display text-xl text-moss-deep">No books match</p>
          <p className="mt-2 text-muted">If it&apos;s a new book, add it with Add a book.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="btn-quiet mt-3"
          >
            Show all books
          </button>
        </div>
      ) : (
        <ul className="grid gap-4">
          {shown.map((book) => (
            <BookCard key={book.id} book={book} members={members} />
          ))}
        </ul>
      )}
    </>
  );
}
