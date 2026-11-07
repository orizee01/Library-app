import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/session-cookie";

// A quick first check: no session cookie means go to the login page. It doesn't
// prove the cookie is valid, so pages and server actions still call requireUser().
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

// Everything except the login pages, Next.js's own files and /api/books, which
// stays public because the spec needs it to work for the WhatsApp bot.
export const config = {
  matcher: "/((?!login|signup|api/books|_next/static|_next/image|favicon.ico).*)",
};
