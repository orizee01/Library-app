import { Suspense } from "react";
import { connection } from "next/server";
import { getMembers } from "@/db/members";
import { AddMemberForm } from "./member-form";

async function MemberList() {
  await connection(); // read the database on each request, not at build time
  const members = await getMembers();

  if (members.length === 0) {
    return <p className="text-stone-600">No members yet.</p>;
  }
  return (
    <ul className="grid gap-3">
      {members.map((member) => (
        <li
          key={member.id}
          className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
        >
          <h3 className="font-semibold text-stone-900">{member.name}</h3>
          <p className="text-sm text-stone-600">{member.phone ?? "No phone number"}</p>
        </li>
      ))}
    </ul>
  );
}

export default function MembersPage() {
  return (
    <>
      <h2 className="mb-4 text-xl font-semibold text-stone-900">Members</h2>
      <div className="mb-6">
        <AddMemberForm />
      </div>
      <Suspense fallback={<p className="text-stone-600">Loading members…</p>}>
        <MemberList />
      </Suspense>
    </>
  );
}
