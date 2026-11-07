"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Books" },
  { href: "/members", label: "Members" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 text-base font-semibold">
      {links.map(({ href, label }) => {
        const current = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`border-b-2 px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none ${
              current
                ? "border-brass text-cream"
                : "border-transparent text-cream/80 hover:border-brass/50 hover:text-cream"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
