import SearchForm from "@/components/forms/SearchForm";
import TripCard from "@/components/booking/TripCard";
import { getFeaturedTrips } from "@/lib/mockData";
import { formatRoute } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 px-6 py-12 shadow-lg ring-1 ring-slate-200 md:px-10">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-sky-50 to-transparent md:block" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="pill">Myanmar Bus & Train</span>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Book seats with confidence. See real-time availability and pick
              your seat.
            </h1>
            <p className="text-lg text-slate-600 md:text-xl">
              One interface for buses and trains across Myanmar. Compare routes,
              reserve seats, and check out securely with login or quick
              registration.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
              <span className="rounded-full bg-slate-100 px-4 py-2">
                Seat hold with expiry
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2">
                NextAuth + Prisma
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2">
                Resend confirmations
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <Link
                href="/search"
                className="rounded-xl bg-sky-600 px-5 py-3 text-white shadow-md transition hover:bg-sky-700"
              >
                Start searching
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-900 shadow-sm transition hover:border-slate-300"
              >
                View dashboard
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-sky-100 blur-2xl" />
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-orange-100 blur-3xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="text-sm font-semibold text-slate-200">
                  Live boarding map
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-sky-200">
                  Real-time
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 px-6 pb-6">
                {Array.from({ length: 24 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-12 rounded-xl border border-white/10 ${
                      idx % 5 === 0
                        ? "bg-sky-500/70"
                        : idx % 4 === 0
                          ? "bg-white/10"
                          : "bg-white/5"
                    }`}
                  />
                ))}
              </div>
              <div className="border-t border-white/10 px-6 py-4 text-sm text-slate-200">
                Guaranteed seat visibility before checkout.
              </div>
            </div>
          </div>
        </div>
        <div className="-mb-14 mt-10">
          <SearchForm />
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Popular this week
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              Featured routes across Myanmar
            </h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-sky-700 hover:text-sky-800"
          >
            See all
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {getFeaturedTrips().map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              operator={trip.operator}
              type={trip.type}
              routeLabel={formatRoute(trip.route.start, trip.route.end)}
              price={trip.price}
              departureTime={trip.departureTime}
              arrivalTime={trip.arrivalTime}
              durationLabel={trip.durationLabel}
              seatsLeft={trip.seatsLeft}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
