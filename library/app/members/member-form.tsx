"use client";

import { useActionState, useState } from "react";
import type { Member } from "@/db/members";
import { addMember, updateMember, type MemberFormState } from "../actions";
import { AddPanel } from "../add-panel";
import { Message } from "../book-forms";

export function AddMemberForm() {
  const [state, action, pending] = useActionState(addMember, {});
  return (
    <AddPanel label="Add a member">
      <form action={action} className="card card-ruled p-5">
        <h3 className="mb-4 hidden font-display text-xl text-moss-deep lg:block">Add a member</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="field-label">
            Name
            <input name="name" defaultValue={state.values?.name} className="field" />
          </label>
          <label className="field-label">
            Phone (optional)
            <input name="phone" type="tel" defaultValue={state.values?.phone} className="field" />
          </label>
        </div>
        <Message text={state.error} />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary mt-4 w-full sm:w-auto lg:w-full"
        >
          {pending ? "Adding…" : "Add member"}
        </button>
      </form>
    </AddPanel>
  );
}

function EditMemberForm({ member, onClose }: { member: Member; onClose: () => void }) {
  const [state, action, pending] = useActionState(
    async (previous: MemberFormState, formData: FormData) => {
      const result = await updateMember(previous, formData);
      if (!result.error) onClose();
      return result;
    },
    {},
  );
  const values = state.values ?? { name: member.name, phone: member.phone ?? "" };

  return (
    <form action={action} className="mt-3 border-t border-dashed border-line pt-3">
      <input type="hidden" name="id" value={member.id} />
      <div className="grid gap-3">
        <label className="field-label">
          Name
          <input name="name" defaultValue={values.name} className="field" />
        </label>
        <label className="field-label">
          Phone (optional)
          <input name="phone" type="tel" defaultValue={values.phone} className="field" />
        </label>
      </div>
      <Message text={state.error} />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onClose} className="btn-quiet">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function EditMember({ member }: { member: Member }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <EditMemberForm member={member} onClose={() => setEditing(false)} />;
  return (
    <button
      type="button"
      aria-label={`Edit ${member.name}`}
      onClick={() => setEditing(true)}
      className="btn-quiet mt-3"
    >
      Edit
    </button>
  );
}
