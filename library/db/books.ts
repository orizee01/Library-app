import { sql } from "./index";

export type Book = {
  id: number;
  title: string;
  year: number | null;
  author: string;
  borrower: string | null;
  due_on: string | null; // YYYY-MM-DD, or null when the book is available
};

// Every book with its author, plus its open loan if it has one.
// A left join keeps books with no open loan: borrower and due_on are null.
export function getBooks() {
  return sql<Book[]>`
    select
      b.id,
      b.title,
      b.year,
      a.name as author,
      m.name as borrower,
      l.due_on::text as due_on
    from books b
    join authors a on a.id = b.author_id
    left join loans l on l.book_id = b.id and l.returned_on is null
    left join members m on m.id = l.member_id
    order by lower(b.title), b.id
  `;
}
