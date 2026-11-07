"use client";

import { useEffect, useState } from "react";
import { JUST_LOGGED_IN_COOKIE } from "@/lib/session-cookie";

const SHOW_FOR_MS = 5000;

export function LoginToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Remove the note straight away, so a refresh doesn't show the message again.
    document.cookie = `${JUST_LOGGED_IN_COOKIE}=; path=/; max-age=0`;
    const timer = setTimeout(() => setVisible(false), SHOW_FOR_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div
      role="status"
      className="toast fixed inset-x-4 top-4 z-50 mx-auto max-w-sm rounded-sm border border-line border-l-4 border-l-moss bg-vellum px-4 py-3 text-center font-semibold text-moss-deep shadow-lg"
    >
      You have successfully logged in.
    </div>
  );
}
