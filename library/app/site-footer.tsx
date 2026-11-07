import { getCurrentUser } from "@/lib/auth";

// Logged-out visitors, on the login and sign-up pages, don't see this footer.
export async function SiteFooter() {
  if (!(await getCurrentUser())) return null;

  return (
    <footer className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <div className="double-rule" />
      <p className="mt-3 text-sm text-muted">
        Books as data, for the WhatsApp bot:{" "}
        <a href="/api/books" className="font-semibold text-moss underline underline-offset-2">
          /api/books
        </a>
      </p>
    </footer>
  );
}
