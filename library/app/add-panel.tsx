"use client";

import { useState, type ReactNode } from "react";

// On a phone the form stays folded away behind a button, so the list comes
// first. On a large screen it always shows, beside the list.
export function AddPanel({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="btn-primary w-full lg:hidden"
      >
        {open ? "Close" : `+ ${label}`}
      </button>
      <div className={`${open ? "mt-3" : "hidden"} lg:mt-0 lg:block`}>{children}</div>
    </>
  );
}
