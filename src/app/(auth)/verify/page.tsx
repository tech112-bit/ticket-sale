import Link from "next/link";
import { verifyEmailToken } from "@/lib/actions";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; email?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token?.toString() || "";
  const email = params?.email?.toString() || "";

  if (!token || !email) {
    return (
      <ResultCard
        status="error"
        title="Invalid link"
        message="Missing verification details. Please open the link from your email."
      />
    );
  }

  const result = await verifyEmailToken(token, email);

  if (!result.success) {
    return (
      <ResultCard
        status="error"
        title="Verification failed"
        message={result.error || "This verification link is invalid or expired."}
      />
    );
  }

  return (
    <ResultCard
      status="success"
      title="Email verified"
      message="You can now sign in with your account."
      ctaHref="/login"
      ctaLabel="Go to login"
    />
  );
}

function ResultCard({
  status,
  title,
  message,
  ctaHref,
  ctaLabel,
}: {
  status: "success" | "error";
  title: string;
  message: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const tones =
    status === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className={`rounded-xl border px-4 py-3 text-sm ${tones}`}>
        <div className="text-xs uppercase tracking-wide">{status === "success" ? "Success" : "Error"}</div>
        <div className="text-lg font-semibold">{title}</div>
        <p className="mt-1 text-sm">{message}</p>
      </div>
      <div className="mt-6 flex gap-3">
        {ctaHref ? (
          <Link
            href={ctaHref}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            {ctaLabel ?? "Continue"}
          </Link>
        ) : (
          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
          >
            Return home
          </Link>
        )}
      </div>
    </div>
  );
}
