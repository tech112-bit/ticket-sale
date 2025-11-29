type Props = {
  defaults?: {
    start?: string;
    end?: string;
    date?: string;
  };
  compact?: boolean;
};

export default function SearchForm({ defaults, compact }: Props) {
  const layoutClass = compact
    ? "grid grid-cols-1 gap-3 sm:grid-cols-3"
    : "grid grid-cols-1 gap-4 md:grid-cols-4";

  return (
    <form
      action="/search"
      method="get"
      className="glass-panel relative z-10 w-full rounded-2xl p-5 shadow-xl ring-1 ring-slate-200/70"
    >
      <div className={layoutClass}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          From
          <input
            name="start"
            defaultValue={defaults?.start}
            placeholder="Yangon"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          To
          <input
            name="end"
            defaultValue={defaults?.end}
            placeholder="Mandalay"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Departure date
          <input
            type="date"
            name="date"
            defaultValue={defaults?.date}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            required
          />
        </label>
        {!compact && (
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Search trips
            </button>
          </div>
        )}
      </div>
      {compact && (
        <div className="mt-3">
          <button
            type="submit"
            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Search trips
          </button>
        </div>
      )}
    </form>
  );
}
