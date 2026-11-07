import { sql } from "./index";

// Every author's name, including authors who don't have a book yet.
export async function getAuthorNames() {
  const authors = await sql<{ name: string }[]>`
    select name
    from authors
    order by lower(name)
  `;
  return authors.map((author) => author.name);
}
