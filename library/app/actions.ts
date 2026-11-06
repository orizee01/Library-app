"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db";

export type BookValues = { title: string; author: string; year: string };
export type BookFormState = { error?: string; values?: BookValues };
export type MemberFormState = { error?: string; values?: { name: string; phone: string } };

const TRY_AGAIN = "Something went wrong. Please try again.";
const BOOK_GONE = "That book no longer exists. Please refresh the page.";

// Form values come from the browser, so they can't be trusted. This returns
// trimmed text with repeated spaces collapsed, and "" for anything else.
function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function readBook(formData: FormData): BookValues {
  return {
    title: text(formData, "title"),
    author: text(formData, "author"),
    year: text(formData, "year"),
  };
}

// Returns the reason a book can't be saved, or null if it's fine.
function bookProblem({ title, author, year }: BookValues) {
  if (!title) return "Please enter a title.";
  if (title.length > 200) return "That title is too long (200 characters at most).";
  if (!author) return "Please enter an author.";
  if (author.length > 200) return "That author's name is too long (200 characters at most).";
  if (year) {
    const number = Number(year);
    const thisYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(year) || number < 1000 || number > thisYear) {
      return `Please enter a real year, from 1000 to ${thisYear}, like 1987.`;
    }
  }
  return null;
}

// Finds the author, or adds them if they're new. The conflict rule uses the
// unique index on lower(name), so "chinua achebe" finds "Chinua Achebe".
async function authorId(name: string) {
  const [author] = await sql<{ id: number }[]>`
    insert into authors (name)
    values (${name})
    on conflict (lower(name)) do update set name = authors.name
    returning id
  `;
  return author.id;
}

// Ids come from the browser too. Returns a whole number that fits the integer
// column, or null for anything else, so it never reaches a query.
function readId(formData: FormData, field: string) {
  const value = text(formData, field);
  const id = Number(value);
  return /^\d+$/.test(value) && id > 0 && id <= 2147483647 ? id : null;
}

export async function updateBook(
  _previous: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const values = readBook(formData);
  const problem = bookProblem(values);
  if (problem) return { error: problem, values };

  const id = readId(formData, "id");
  if (!id) return { error: BOOK_GONE, values };

  try {
    const author_id = await authorId(values.author);
    const updated = await sql`
      update books
      set title = ${values.title},
          year = ${values.year ? Number(values.year) : null},
          author_id = ${author_id}
      where id = ${id}
      returning id
    `;
    if (updated.length === 0) return { error: BOOK_GONE, values };
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN, values };
  }

  revalidatePath("/");
  return {};
}

export async function deleteBook(formData: FormData): Promise<{ error?: string }> {
  const id = readId(formData, "id");
  if (!id) return { error: BOOK_GONE };

  try {
    // The check and the delete are one statement, so a book can't be lent
    // between checking it and deleting it. Its old loans go with it.
    const deleted = await sql`
      delete from books
      where id = ${id}
        and not exists (
          select 1 from loans where book_id = ${id} and returned_on is null
        )
      returning id
    `;
    if (deleted.length === 0) {
      const [book] = await sql`select id from books where id = ${id}`;
      return {
        error: book
          ? "This book is on loan, so it can't be deleted. Record its return first."
          : BOOK_GONE,
      };
    }
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN };
  }

  revalidatePath("/");
  return {};
}

export async function addMember(
  _previous: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  const values = { name: text(formData, "name"), phone: text(formData, "phone") };

  if (!values.name) return { error: "Please enter the member's name.", values };
  if (values.name.length > 200) {
    return { error: "That name is too long (200 characters at most).", values };
  }
  if (values.phone && !/^\+?[\d\s()-]{5,20}$/.test(values.phone)) {
    return { error: "Please enter a real phone number, or leave it empty.", values };
  }

  try {
    await sql`
      insert into members (name, phone)
      values (${values.name}, ${values.phone || null})
    `;
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN, values };
  }

  revalidatePath("/members");
  revalidatePath("/"); // the lend list on the Books page shows members too
  return {};
}

export async function addBook(
  _previous: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const values = readBook(formData);
  const problem = bookProblem(values);
  if (problem) return { error: problem, values };

  try {
    const author_id = await authorId(values.author);
    await sql`
      insert into books (title, year, author_id)
      values (${values.title}, ${values.year ? Number(values.year) : null}, ${author_id})
    `;
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN, values };
  }

  revalidatePath("/");
  return {};
}
