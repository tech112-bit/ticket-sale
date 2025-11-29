"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import SeatMap, { Seat } from "./SeatMap";
import { BookingFormState } from "@/lib/types";

type Props = {
  seats: Seat[];
  vehicle: "BUS" | "TRAIN";
  tripId: string;
  isLoggedIn: boolean;
  action: (state: BookingFormState, formData: FormData) => Promise<BookingFormState>;
};

const initialState: BookingFormState = { success: false };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
    >
      {pending ? "Booking..." : "Book selected seat"}
    </button>
  );
}

export default function SeatBookingForm({ seats, vehicle, tripId, isLoggedIn, action }: Props) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.success) {
      setSelectedSeat(null);
    }
  }, [state.success]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <SeatMap
        seats={seats}
        vehicle={vehicle}
        selectedSeatId={selectedSeat?.id ?? null}
        onSelect={setSelectedSeat}
      />

      <input type="hidden" name="seatId" value={selectedSeat?.id ?? ""} />
      <input type="hidden" name="tripId" value={tripId} />

      {state.error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Seat booked! Reference: {state.reference || "pending"}.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <SubmitButton disabled={!selectedSeat || !isLoggedIn} />
        {!isLoggedIn ? (
          <span>Login or register to book a seat.</span>
        ) : selectedSeat ? (
          <span>Selected seat: {selectedSeat.label}</span>
        ) : (
          <span>Select an available seat to continue.</span>
        )}
      </div>
    </form>
  );
}
