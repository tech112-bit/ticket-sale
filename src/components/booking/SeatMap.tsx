"use client";

import { useEffect, useMemo, useState } from "react";

export type SeatStatus = "AVAILABLE" | "BOOKED" | "RESERVED" | "UNAVAILABLE";

export type Seat = {
  id: string;
  label: string;
  status: SeatStatus;
};

type Props = {
  seats: Seat[];
  vehicle: "BUS" | "TRAIN";
  selectedSeatId?: string | null;
  onSelect?: (seat: Seat | null) => void;
};

const statusStyles: Record<SeatStatus, string> = {
  AVAILABLE:
    "border-sky-200 bg-white text-slate-800 hover:border-sky-400 hover:bg-sky-50",
  BOOKED: "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed",
  RESERVED:
    "border-amber-200 bg-amber-50 text-amber-700 cursor-not-allowed opacity-80",
  UNAVAILABLE:
    "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed",
};

export default function SeatMap({ seats, vehicle, selectedSeatId, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(selectedSeatId ?? null);

  useEffect(() => {
    setSelected(selectedSeatId ?? null);
  }, [selectedSeatId]);

  const layout = useMemo(() => {
    const columns = vehicle === "BUS" ? 4 : 5;
    const rows: Seat[][] = [];
    seats.forEach((seat, index) => {
      const rowIndex = Math.floor(index / columns);
      if (!rows[rowIndex]) rows[rowIndex] = [];
      rows[rowIndex].push(seat);
    });
    return rows;
  }, [seats, vehicle]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">
            Seat map - {vehicle === "BUS" ? "2+2" : "2+1"} layout
          </div>
          <div className="text-xs text-slate-500">Tap an available seat to select</div>
        </div>
        <div className="grid gap-2">
          {layout.map((row, idx) => (
            <div
              key={idx}
              className={`grid ${vehicle === "BUS" ? "grid-cols-4" : "grid-cols-5"} gap-2`}
            >
              {row.map((seat) => {
                const isSelected = selected === seat.id;
                const isDisabled =
                  seat.status === "BOOKED" ||
                  seat.status === "RESERVED" ||
                  seat.status === "UNAVAILABLE";
                const handleClick = () => {
                  const nextSelected = isSelected ? null : seat.id;
                  setSelected(nextSelected);
                  onSelect?.(nextSelected ? seat : null);
                };
                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={`flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      statusStyles[seat.status]
                    } ${
                      isSelected
                        ? "ring-2 ring-sky-300 border-sky-400 bg-sky-50 text-slate-900"
                        : ""
                    }`}
                    disabled={isDisabled}
                    onClick={handleClick}
                    aria-pressed={isSelected}
                  >
                    {seat.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {[
          { label: "Available", color: "bg-white border-sky-200" },
          { label: "Selected", color: "bg-sky-50 border-sky-300" },
          { label: "Booked", color: "bg-slate-100 border-slate-200" },
          { label: "Reserved", color: "bg-amber-50 border-amber-200" },
        ].map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1"
          >
            <span
              className={`h-3 w-3 rounded-full border ${item.color}`}
              aria-hidden="true"
            />
            {item.label}
          </span>
        ))}
      </div>

      {selected && (
        <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
          Selected seat: {selected}. Proceed to login or register to confirm booking.
        </div>
      )}
    </div>
  );
}
