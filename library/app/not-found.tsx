import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card card-ruled mx-auto mt-6 max-w-md p-10 text-center">
      <h2 className="font-display text-2xl text-moss-deep">Not on our shelves</h2>
      <p className="mt-2 text-muted">We couldn&apos;t find that page.</p>
      <Link href="/" className="btn-primary mt-5">
        Back to the books
      </Link>
    </div>
  );
}
