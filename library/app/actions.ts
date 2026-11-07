"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db";
import { requireUser } from "@/lib/auth";

export type BookValues = { title: string; author: string; year: string };
export type BookFormState = { error?: string; values?: BookValues };
export type MemberFormState = { error?: string; values?: { name: string; phone: string } };

const TRY_AGAIN = "Something went wrong. Please try again.";
const BOOK_GONE = "That book no longer exists. Please refresh the page.";
const MEMBER_GONE = "That member no longer exists. Please refresh the page.";

// Both pages show books, members and loans, so a change to one refreshes both.
function refreshPages() {
  revalidatePath("/");
  revalidatePath("/members");
}

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

function readMember(formData: FormData) {
  return { name: text(formData, "name"), phone: text(formData, "phone") };
}

// Returns the reason a member can't be saved, or null if it's fine.
function memberProblem({ name, phone }: { name: string; phone: string }) {
  if (!name) return "Please enter the member's name.";
  if (name.length > 200) return "That name is too long (200 characters at most).";
  if (phone && !/^\+?[\d\s()-]{5,20}$/.test(phone)) {
    return "Please enter a real phone number, or leave it empty.";
  }
  return null;
}

// Anyone can send a request straight to a server action, so every action below
// calls requireUser() first, even though the pages check too.

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
  await requireUser();
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

  refreshPages();
  return {};
}

export async function deleteBook(formData: FormData): Promise<{ error?: string }> {
  await requireUser();
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

  refreshPages();
  return {};
}

export async function lendBook(formData: FormData): Promise<{ error?: string }> {
  await requireUser();
  const bookId = readId(formData, "id");
  const memberId = readId(formData, "member_id");
  if (!bookId) return { error: BOOK_GONE };
  if (!memberId) return { error: "Please choose a member." };

  try {
    // The unique index allows one open loan per book. If there already is one,
    // nothing is inserted and nothing comes back.
    const loans = await sql`
      insert into loans (book_id, member_id, borrowed_on, due_on)
      values (${bookId}, ${memberId}, current_date, current_date + 14)
      on conflict (book_id) where returned_on is null do nothing
      returning id
    `;
    if (loans.length === 0) {
      revalidatePath("/"); // this screen was out of date, so show the current loan
      return { error: "This book is already on loan." };
    }
  } catch (error) {
    // 23503: the book or member id doesn't point at a real row.
    if ((error as { code?: string }).code === "23503") {
      return { error: "That book or member no longer exists. Please refresh the page." };
    }
    console.error(error);
    return { error: TRY_AGAIN };
  }

  refreshPages();
  return {};
}

export async function returnBook(formData: FormData): Promise<{ error?: string }> {
  await requireUser();
  const id = readId(formData, "id");
  if (!id) return { error: BOOK_GONE };

  try {
    const returned = await sql`
      update loans
      set returned_on = current_date
      where book_id = ${id} and returned_on is null
      returning id
    `;
    if (returned.length === 0) return { error: "This book isn't on loan." };
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN };
  }

  refreshPages();
  return {};
}

export async function addMember(
  _previous: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireUser();
  const values = readMember(formData);
  const problem = memberProblem(values);
  if (problem) return { error: problem, values };

  try {
    await sql`
      insert into members (name, phone)
      values (${values.name}, ${values.phone || null})
    `;
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN, values };
  }

  refreshPages();
  return {};
}

export async function updateMember(
  _previous: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireUser();
  const values = readMember(formData);
  const problem = memberProblem(values);
  if (problem) return { error: problem, values };

  const id = readId(formData, "id");
  if (!id) return { error: MEMBER_GONE, values };

  try {
    const updated = await sql`
      update members
      set name = ${values.name}, phone = ${values.phone || null}
      where id = ${id}
      returning id
    `;
    if (updated.length === 0) return { error: MEMBER_GONE, values };
  } catch (error) {
    console.error(error);
    return { error: TRY_AGAIN, values };
  }

  refreshPages();
  return {};
}

export async function addBook(
  _previous: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireUser();
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

  refreshPages();
  return {};
}
