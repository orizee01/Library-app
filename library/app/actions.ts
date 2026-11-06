"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db";

export type BookValues = { title: string; author: string; year: string };
export type BookFormState = { error?: string; values?: BookValues };

const TRY_AGAIN = "Something went wrong. Please try again.";

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
