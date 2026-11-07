import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { JUST_LOGGED_IN_COOKIE } from "@/lib/session-cookie";
import { LoginToast } from "./login-toast";
import { logOut } from "./auth-actions";
import { Nav } from "./nav";

// The header's right side. Logged-out visitors see nothing here.
export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;
  const justLoggedIn = (await cookies()).has(JUST_LOGGED_IN_COOKIE);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {justLoggedIn && <LoginToast />}
      <Nav />
      <span className="max-w-40 truncate text-sm text-cream/85">{user.name}</span>
      <form action={logOut}>
        <button
          type="submit"
          className="cursor-pointer rounded-sm px-3 py-2 text-sm font-semibold text-cream/85 transition-colors hover:bg-white/10 hover:text-cream focus-visible:ring-2 focus-visible:ring-cream focus-visible:outline-none"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
