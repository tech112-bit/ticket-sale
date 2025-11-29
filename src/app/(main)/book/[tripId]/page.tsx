import SeatBookingForm from "@/components/booking/SeatBookingForm";
import TripCard from "@/components/booking/TripCard";
import { createBookingAction } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { fetchTripWithSeats } from "@/lib/data";
import { BookingFormState } from "@/lib/types";
import Link from "next/link";

export async function bookSeatAction(
  _state: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  "use server";

  const seatId = formData.get("seatId")?.toString();
  const tripId = formData.get("tripId")?.toString();
  const paymentMethod = formData.get("paymentMethod")?.toString() as
    | "CARD"
    | "KPAY"
    | "WAVE"
    | undefined;
  if (!seatId) {
    return { success: false, error: "Select a seat before booking." };
  }
  if (!tripId) {
    return { success: false, error: "Missing trip information." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please log in or register to book." };
  }

  const result = await createBookingAction({
    tripId,
    seatId,
    userId: session.user.id,
    paymentMethod,
  });

  if (!result.success) {
    return { success: false, error: result.error || "Booking failed." };
  }

  return { success: true, reference: result.reference ?? null };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const resolvedParams = await params;
  const tripId = resolvedParams.tripId;
  if (!tripId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Trip not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          Missing trip information. Please return to search and try again.
        </p>
        <div className="mt-4">
          <Link
            href="/search"
            className="text-sm font-semibold text-sky-700 hover:text-sky-800"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const trip = await fetchTripWithSeats(tripId);
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  if (!trip) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Trip not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          We could not find that itinerary. Please search again.
        </p>
        <div className="mt-4">
          <Link
            href="/search"
            className="text-sm font-semibold text-sky-700 hover:text-sky-800"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Choose your seat
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          {trip.routeLabel} - {trip.type}
        </h1>
        <p className="text-sm text-slate-600">
          Seats are held briefly during checkout.{" "}
          {isLoggedIn
            ? "You're signed in - pick a seat and book."
            : "Log in or create an account to confirm."}
        </p>
      </div>

      <TripCard
        id={trip.id}
        operator={trip.operator}
        type={trip.type}
        routeLabel={trip.routeLabel}
        price={trip.price}
        departureTime={trip.departureTime}
        arrivalTime={trip.arrivalTime}
        durationLabel={trip.durationLabel}
        seatsLeft={trip.seatsLeft}
        cta="Review seats"
      />

      <SeatBookingForm
        seats={trip.seats}
        vehicle={trip.type}
        tripId={trip.id}
        isLoggedIn={isLoggedIn}
        action={bookSeatAction}
      />

      {isLoggedIn ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-900 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500">
                Secure checkout
              </div>
              <div className="text-lg font-semibold">
                You're logged in. Select a seat and confirm.
              </div>
              <p className="text-sm text-slate-600">
                Bookings are linked to your account. We'll email your ticket and receipt.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-900 px-6 py-5 text-white shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-sky-200">
                Secure checkout
              </div>
              <div className="text-lg font-semibold">
                Login or register to complete booking
              </div>
              <p className="text-sm text-slate-200">
                Session-backed checkout with NextAuth and Prisma. Confirmation
                emails powered by Resend.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-white/30 bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
