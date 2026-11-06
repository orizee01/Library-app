import { Suspense } from "react";
import { connection } from "next/server";
import { getBooks, type Book } from "@/db/books";
import { AddBookForm } from "./book-forms";

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function BookCard({ book }: { book: Book }) {
  return (
    <li className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-stone-900">{book.title}</h3>
      <p className="text-sm text-stone-600">
        {book.author}
        {book.year ? `, ${book.year}` : ""}
      </p>
      {book.due_on ? (
        <p className="mt-2 text-sm font-medium text-amber-800">
          On loan to {book.borrower}, due {formatDate(book.due_on)}
        </p>
      ) : (
        <p className="mt-2 text-sm font-medium text-emerald-700">Available</p>
      )}
    </li>
  );
}

async function BookList() {
  await connection(); // read the database on each request, not at build time
  const books = await getBooks();

  if (books.length === 0) {
    return <p className="text-stone-600">No books yet.</p>;
  }
  return (
    <ul className="grid gap-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </ul>
  );
}

export default function BooksPage() {
  return (
    <>
      <h2 className="mb-4 text-xl font-semibold text-stone-900">Books</h2>
      <div className="mb-6">
        <AddBookForm />
      </div>
      <Suspense fallback={<p className="text-stone-600">Loading books…</p>}>
        <BookList />
      </Suspense>
    </>
  );
}
