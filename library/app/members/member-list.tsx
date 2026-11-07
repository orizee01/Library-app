"use client";

import { useState } from "react";
import type { MemberWithLoans } from "@/db/members";
import { formatDate, matchesSearch } from "@/lib/format";
import { EditMember } from "./member-form";

function initials(name: string) {
  const words = name.split(" ");
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0];
  return letters.toUpperCase();
}

function MemberCard({ member }: { member: MemberWithLoans }) {
  return (
    <li className="card card-ruled p-4">
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-moss font-display text-brass shadow-[inset_0_0_0_1px_var(--color-moss),inset_0_0_0_2px_var(--color-brass)]"
        >
          {initials(member.name)}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg break-words text-moss-deep">{member.name}</h3>
          {member.phone ? (
            <a
              href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
              className="font-stamp text-sm text-muted underline-offset-2 hover:underline"
            >
              {member.phone}
            </a>
          ) : (
            <p className="text-sm text-muted italic">No phone number</p>
          )}
        </div>
      </div>
      <div className="mt-3 border-t border-dashed border-line pt-3 text-sm">
        {member.loans.length === 0 ? (
          <p className="text-muted italic">No books out</p>
        ) : (
          <ul className="grid gap-2">
            {member.loans.map((loan) => (
              <li key={loan.book_id}>
                <span className="font-semibold break-words">{loan.title}</span>
                <span className={`block font-stamp ${loan.overdue ? "font-bold text-oxblood" : "text-muted"}`}>
                  {loan.overdue ? "Overdue, was due" : "Due"} {formatDate(loan.due_on)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <EditMember member={member} />
    </li>
  );
}

export function MemberList({ members }: { members: MemberWithLoans[] }) {
  const [search, setSearch] = useState("");

  if (members.length === 0) {
    return (
      <div className="card card-ruled p-10 text-center">
        <p className="font-display text-xl text-moss-deep">No members yet</p>
        <p className="mt-1 text-muted">Add your first member to start lending.</p>
      </div>
    );
  }

  const shown = members.filter((member) =>
    matchesSearch(search, [member.name, member.phone, ...member.loans.map((loan) => loan.title)]),
  );
  const borrowing = members.filter((member) => member.loans.length > 0).length;

  return (
    <>
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name, phone or book"
        aria-label="Search members"
        className="field mt-0"
      />
      <p className="mt-3 mb-4 text-muted italic">
        {members.length} {members.length === 1 ? "member" : "members"} · {borrowing} with books out
      </p>
      {shown.length === 0 ? (
        <div className="card card-ruled p-10 text-center">
          <p className="font-display text-xl text-moss-deep">No members match</p>
          <button type="button" onClick={() => setSearch("")} className="btn-quiet mt-3">
            Show all members
          </button>
        </div>
      ) : (
        <ul className="grid items-start gap-4 sm:grid-cols-2">
          {shown.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </ul>
      )}
    </>
  );
}
