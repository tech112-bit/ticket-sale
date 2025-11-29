import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/book/demo-trip", label: "Book" },
  { href: "/dashboard", label: "Dashboard" },
];

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function Navbar() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email;

  return (
    <header className="relative z-20 border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900"
        >
          <span className="rounded-md bg-sky-100 px-2 py-1 text-sm font-bold text-sky-700">
            MY
          </span>
          <span>Transit</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {session?.user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-slate-700 md:inline">
              {userName}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-800 transition hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
