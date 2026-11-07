"use client";

import { useEffect } from "react";

// Shown if a page can't load, for example when the database can't be reached.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card card-ruled mx-auto mt-6 max-w-md p-10 text-center">
      <h2 className="font-display text-2xl text-moss-deep">The library can&apos;t be reached</h2>
      <p className="mt-2 text-muted">Nothing has been lost. Please try again in a moment.</p>
      <button type="button" onClick={() => retry()} className="btn-primary mt-5">
        Try again
      </button>
    </div>
  );
}
