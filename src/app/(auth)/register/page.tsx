import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { registerUser } from "@/lib/actions";

async function register(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";

  const result = await registerUser({ name, email, password });
  if (!result.success) {
    const message = encodeURIComponent(result.error || "Registration failed");
    redirect(`/register?error=${message}`);
  }

  redirect("/login?registered=1");
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Create account
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Register</h1>
        <p className="text-sm text-slate-600">
          Save your passenger details and view upcoming trips anytime.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" action={register}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Full name
          <input
            name="name"
            placeholder="Traveler Name"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            required
          />
        </label>
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
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Create account
        </button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-sky-700 hover:text-sky-800" href="/login">
          Login here
        </Link>
        .
      </p>
    </div>
  );
}
