import { connection } from "next/server";
import { getBooks } from "@/db/books";

// GET /api/books returns every book as JSON. The link is public, so it says
// whether a book is on loan but leaves out who borrowed it.
export async function GET() {
  await connection(); // read the database on each request, not at build time

  try {
    const books = await getBooks();
    return Response.json(
      books.map(({ id, title, year, author, due_on }) => ({
        id,
        title,
        year,
        author,
        on_loan: due_on !== null,
        due_on,
      })),
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load the books." }, { status: 500 });
  }
}
