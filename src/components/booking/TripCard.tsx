import Link from "next/link";
import { VehicleType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type TripCardProps = {
  id: string;
  operator: string;
  type: VehicleType;
  routeLabel: string;
  price: number;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  seatsLeft: number;
  cta?: string;
};

export default function TripCard(props: TripCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {props.type}
          </span>
          <span className="text-lg font-semibold text-slate-900">
            {props.operator}
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {props.seatsLeft} seats left
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <span className="rounded-lg bg-sky-50 px-3 py-1 font-semibold text-sky-700">
          {props.routeLabel}
        </span>
        <span>Depart: {props.departureTime}</span>
        <span>Arrive: {props.arrivalTime}</span>
        <span className="font-medium text-slate-900">{props.durationLabel}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-slate-900">
          {formatCurrency(props.price)}
        </div>
        <Link
          href={`/book/${props.id}`}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {props.cta || "Select seats"}
        </Link>
      </div>
    </div>
  );
}
