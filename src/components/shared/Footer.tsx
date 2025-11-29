export default function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-slate-800">Myanmar Transit</span>
          <span>Booking peace of mind for bus and train travelers.</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a
            className="hover:text-slate-900"
            href="mailto:support@mytransit.example"
          >
            support@mytransit.example
          </a>
          <span className="h-4 w-px bg-slate-300" />
          <span>© {new Date().getFullYear()} Ticket System</span>
        </div>
      </div>
    </footer>
  );
}
