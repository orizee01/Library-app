import { Suspense } from "react";
import { connection } from "next/server";
import { getBooks } from "@/db/books";
import { getMembers } from "@/db/members";
import { AddBookForm } from "./book-forms";
import { BookList } from "./book-list";

function LoadingBooks() {
  return (
    <div role="status" aria-label="Loading books" className="grid gap-4 pt-10">
      {[1, 2, 3].map((n) => (
        <div key={n} className="card h-52 animate-pulse bg-vellum/60" />
      ))}
    </div>
  );
}

async function BooksContent() {
  await connection(); // read the database on each request, not at build time
  const books = await getBooks();
  const members = await getMembers();
  const authors = [...new Set(books.map((book) => book.author))].sort();

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
      <aside className="lg:sticky lg:top-6 lg:order-last">
        <AddBookForm authors={authors} />
      </aside>
      <section aria-label="All books" className="min-w-0">
        <BookList books={books} members={members} />
      </section>
    </div>
  );
}

export default function BooksPage() {
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow">The Catalogue</p>
        <h2 className="page-title">Books</h2>
        <div className="double-rule mt-4" />
      </div>
      <Suspense fallback={<LoadingBooks />}>
        <BooksContent />
      </Suspense>
    </>
  );
}
