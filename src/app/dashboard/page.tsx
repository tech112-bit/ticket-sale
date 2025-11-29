export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm, PasswordForm } from "@/components/account/AccountForms";
import { auth } from "@/lib/auth";
import { fetchBookings, hasDb } from "@/lib/data";
import { cancelBookingAction, confirmBookingPaymentAction } from "@/lib/actions";

async function handleConfirm(formData: FormData) {
  "use server";
  await confirmBookingPaymentAction(formData);
  redirect("/dashboard");
}

async function handleCancel(formData: FormData) {
  "use server";
  await cancelBookingAction(formData);
  redirect("/dashboard");
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id || null;
  const bookings = userId ? await fetchBookings(userId) : [];
  const activeBookings = bookings.filter((b) => b.status !== "CANCELLED");
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pending = bookings.filter(
    (b) => b.status !== "CONFIRMED" && b.status !== "CANCELLED",
  ).length;
  const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
  const canMutate = hasDb && Boolean(userId);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/60 bg-gradient-to-r from-sky-50 via-white to-amber-50 p-6 shadow-lg ring-1 ring-slate-200/60 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              My account
            </p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Track upcoming trips, seat selections, and account activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
            >
              Book a new trip
            </Link>
            <Link
              href="/book/yangon-mandalay-bus"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
            >
              Continue seat hold
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatPill label="Confirmed trips" value={confirmed} tone="success" />
          <StatPill label="Pending / payment" value={pending} tone="warning" />
          <StatPill label="Cancelled" value={cancelled} tone="danger" />
        </div>
      </section>

      {userId ? (
        activeBookings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                canMutate={canMutate}
                onConfirm={handleConfirm}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
            <p className="text-lg font-semibold">No bookings yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Book a trip and your seats will appear here.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/search"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Search trips
              </Link>
              <Link
                href="/book/demo-trip"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
              >
                Try demo trip
              </Link>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Login to see your bookings</p>
          <p className="mt-1 text-sm text-slate-600">
            Bookings and receipts appear here once you sign in.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Account security</h2>
            <p className="text-sm text-slate-600">
              Update your display name and rotate your password using server actions secured by
              NextAuth and Prisma.
            </p>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Signed in as {session?.user?.email || "guest"}
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ProfileForm defaultName={session?.user?.name ?? ""} />
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}

type StatTone = "success" | "warning" | "neutral" | "danger";

function BookingCard({
  booking,
  canMutate,
  onConfirm,
}: {
  booking: Awaited<ReturnType<typeof fetchBookings>>[number];
  canMutate: boolean;
  onConfirm: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
            {booking.vehicleType}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ref: {booking.reference}
          </span>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            booking.status === "CONFIRMED"
              ? "bg-green-100 text-green-700"
              : booking.status === "CANCELLED"
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
          }`}
        >
          {booking.status}
        </span>
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900">
        {booking.routeLabel}
      </div>
      <div className="mt-1 text-sm text-slate-600">
        Seat {booking.seatNumber} | Depart {booking.departure}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-slate-700">
        <Link
          href={`/book/${booking.tripId}`}
          className="rounded-xl bg-sky-600 px-4 py-2 text-white shadow-sm transition hover:bg-sky-700"
        >
          View seats
        </Link>
        <a
          href={`/api/tickets/${booking.id}`}
          download
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:border-slate-300"
        >
          Download ticket (PDF)
        </a>
        <Link
          href={`/book/${booking.tripId}?changeSeat=1`}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:border-slate-300"
        >
          Change seat
        </Link>
        {booking.status !== "CONFIRMED" && booking.status !== "CANCELLED" ? (
          <form action={onConfirm}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button
              type="submit"
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-green-800 shadow-sm transition hover:border-green-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canMutate}
            >
              Pay now
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: StatTone;
}) {
  const tones: Record<StatTone, string> = {
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    neutral: "bg-slate-50 text-slate-800 border-slate-200",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${tones[tone]}`}
    >
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-lg text-inherit">{value}</div>
    </div>
  );
}
