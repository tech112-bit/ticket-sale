import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function login(formData: FormData) {
  "use server";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });
  if (!user) {
    redirect("/login?error=credentials");
  }
  if (!user.emailVerified) {
    redirect("/login?error=verify");
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Login failed", error);
      redirect("/login?error=credentials");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const showRegistered = params?.registered === "1";
  const errorParam = params?.error;
  const errorMessage =
    errorParam === "credentials"
      ? "Incorrect email or password. Try again."
      : errorParam === "verify"
        ? "Check your email and verify your account before signing in."
        : errorParam;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Welcome back
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Login</h1>
        <p className="text-sm text-slate-600">
          Access your saved bookings and continue checkout securely.
        </p>
      </div>

      {showRegistered ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Account created. Check your email for the verification link, then sign in.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <form className="space-y-4" action={login}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            name="password"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          Login
        </button>
      </form>
      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link className="font-semibold text-sky-700 hover:text-sky-800" href="/register">
          Create an account
        </Link>{" "}
        to finish your booking.
      </p>
    </div>
  );
}
