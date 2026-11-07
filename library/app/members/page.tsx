import { Suspense } from "react";
import { connection } from "next/server";
import { getMembersWithLoans } from "@/db/members";
import { AddMemberForm } from "./member-form";
import { MemberList } from "./member-list";

function LoadingMembers() {
  return (
    <div role="status" aria-label="Loading members" className="grid gap-4 pt-10 sm:grid-cols-2">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="card h-40 animate-pulse bg-vellum/60" />
      ))}
    </div>
  );
}

async function MembersContent() {
  await connection(); // read the database on each request, not at build time
  const members = await getMembersWithLoans();
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
      <aside className="lg:sticky lg:top-6 lg:order-last">
        <AddMemberForm />
      </aside>
      <section aria-label="All members" className="min-w-0">
        <MemberList members={members} />
      </section>
    </div>
  );
}

export default function MembersPage() {
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow">The Register</p>
        <h2 className="page-title">Members</h2>
        <div className="double-rule mt-4" />
      </div>
      <Suspense fallback={<LoadingMembers />}>
        <MembersContent />
      </Suspense>
    </>
  );
}
