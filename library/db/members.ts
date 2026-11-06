import { sql } from "./index";

export type Member = { id: number; name: string; phone: string | null };

export function getMembers() {
  return sql<Member[]>`
    select id, name, phone
    from members
    order by lower(name), id
  `;
}
