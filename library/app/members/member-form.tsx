"use client";

import { useActionState } from "react";
import { addMember } from "../actions";

const inputClass =
  "mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900";

export function AddMemberForm() {
  const [state, action, pending] = useActionState(addMember, {});
  return (
    <form action={action} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-stone-900">Add a member</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-stone-700">
          Name
          <input name="name" defaultValue={state.values?.name} className={inputClass} />
        </label>
        <label className="text-sm font-medium text-stone-700">
          Phone (optional)
          <input
            name="phone"
            type="tel"
            defaultValue={state.values?.phone}
            className={inputClass}
          />
        </label>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add member"}
      </button>
    </form>
  );
}
