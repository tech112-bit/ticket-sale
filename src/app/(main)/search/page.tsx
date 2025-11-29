import SearchForm from "@/components/forms/SearchForm";
import TripCard from "@/components/booking/TripCard";
import { fetchTrips } from "@/lib/data";
import { formatRoute } from "@/lib/utils";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { start?: string; end?: string; date?: string };
}) {
  const { start, end, date } = searchParams;
  const hasQuery = Boolean(start || end || date);
  const resultsPromise = fetchTrips({ start, end, date });

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Find a trip
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Search results</h1>
        <p className="text-sm text-slate-600">
          Showing live availability for buses and trains. Adjust locations or
          dates to refine.
        </p>
      </div>

      <SearchForm
        defaults={{ start: start || "", end: end || "", date: date || "" }}
        compact
      />

      <Results
        promise={resultsPromise}
        hasQuery={hasQuery}
        start={start}
        end={end}
      />
    </div>
  );
}

async function Results({
  promise,
  hasQuery,
  start,
  end,
}: {
  promise: ReturnType<typeof fetchTrips>;
  hasQuery: boolean;
  start?: string;
  end?: string;
}) {
  const results = await promise;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {hasQuery
            ? `${start || "Any origin"} -> ${end || "Any destination"}`
            : "All routes"}
        </h2>
        <span className="text-sm text-slate-600">
          {results.length} options - Instant seat selection
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((trip) => (
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
    </div>
  );
}
