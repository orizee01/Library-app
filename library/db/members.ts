import { sql } from "./index";

export type Member = { id: number; name: string; phone: string | null };

export type MemberLoan = {
  book_id: number;
  title: string;
  due_on: string; // YYYY-MM-DD
  overdue: boolean;
};

export type MemberWithLoans = Member & { loans: MemberLoan[] };

export function getMembers() {
  return sql<Member[]>`
    select id, name, phone
    from members
    order by lower(name), id
  `;
}

// Every member with the books they have out now, soonest due first.
// A left join keeps members with no open loans: their list is empty.
export function getMembersWithLoans() {
  return sql<MemberWithLoans[]>`
    select
      m.id,
      m.name,
      m.phone,
      coalesce(
        json_agg(
          json_build_object(
            'book_id', b.id,
            'title', b.title,
            'due_on', l.due_on,
            'overdue', l.due_on < current_date
          )
          order by l.due_on, lower(b.title)
        ) filter (where l.id is not null),
        '[]'::json
      ) as loans
    from members m
    left join loans l on l.member_id = m.id and l.returned_on is null
    left join books b on b.id = l.book_id
    group by m.id
    order by lower(m.name), m.id
  `;
}
