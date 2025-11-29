import {
  Booking,
  Seat,
  SeatLayout,
  SeatStatus,
  Trip,
  TripSearchParams,
  VehicleType,
} from "./types";

const featuredTrips: Trip[] = [
  {
    id: "yangon-mandalay-bus",
    operator: "Mandalar Minn",
    type: VehicleType.BUS,
    route: { start: "Yangon", end: "Mandalay" },
    price: 42000,
    departureTime: "07:30",
    arrivalTime: "14:10",
    durationLabel: "6h 40m - Express",
    seatLayout: SeatLayout.BUS_TWO_PLUS_TWO,
    seatsLeft: 8,
  },
  {
    id: "yangon-bagan-train",
    operator: "Myanmar Rail",
    type: VehicleType.TRAIN,
    route: { start: "Yangon", end: "Bagan" },
    price: 36000,
    departureTime: "18:00",
    arrivalTime: "07:05",
    durationLabel: "13h - Sleeper",
    seatLayout: SeatLayout.TRAIN_TWO_PLUS_ONE,
    seatsLeft: 14,
  },
  {
    id: "mandalay-taunggyi-bus",
    operator: "JJ Express",
    type: VehicleType.BUS,
    route: { start: "Mandalay", end: "Taunggyi" },
    price: 28000,
    departureTime: "09:15",
    arrivalTime: "14:30",
    durationLabel: "5h 15m - VIP",
    seatLayout: SeatLayout.BUS_TWO_PLUS_ONE,
    seatsLeft: 5,
  },
  {
    id: "demo-trip",
    operator: "Demo Express",
    type: VehicleType.BUS,
    route: { start: "Yangon", end: "Nay Pyi Taw" },
    price: 25000,
    departureTime: "10:00",
    arrivalTime: "14:30",
    durationLabel: "4h 30m - Express",
    seatLayout: SeatLayout.BUS_TWO_PLUS_TWO,
    seatsLeft: 12,
  },
];

export function getFeaturedTrips() {
  return featuredTrips;
}

export function searchTrips(params: TripSearchParams) {
  const normalizedStart = params.start?.toLowerCase().trim();
  const normalizedEnd = params.end?.toLowerCase().trim();

  return featuredTrips.filter((trip) => {
    const matchesStart = normalizedStart
      ? trip.route.start.toLowerCase().includes(normalizedStart)
      : true;
    const matchesEnd = normalizedEnd
      ? trip.route.end.toLowerCase().includes(normalizedEnd)
      : true;
    return matchesStart && matchesEnd;
  });
}

export function getTripById(id: string) {
  return featuredTrips.find((trip) => trip.id === id);
}

export function generateSeats(
  total = 28,
  layout: SeatLayout = SeatLayout.BUS_TWO_PLUS_TWO,
): Seat[] {
  const perRow = layout === SeatLayout.TRAIN_TWO_PLUS_ONE ? 5 : 4;
  return Array.from({ length: total }).map((_, idx) => {
    const row = String.fromCharCode(65 + Math.floor(idx / perRow));
    const seatNumber = (idx % perRow) + 1;
    let status = SeatStatus.AVAILABLE;
    if (idx % 7 === 0) status = SeatStatus.BOOKED;
    else if (idx % 5 === 0) status = SeatStatus.RESERVED;
    return {
      id: `seat-${idx + 1}`,
      seatNumber: `${row}${seatNumber}`,
      status,
    };
  });
}

export function getMockBookings(): Booking[] {
  return [
    {
      id: "BK-20481",
      tripId: "yangon-mandalay-bus",
      seatId: "seat-7",
      status: "CONFIRMED",
      reference: "BK-20481",
      departure: "Jan 22, 07:30",
      seatNumber: "B2",
      routeLabel: "Yangon -> Mandalay",
      vehicleType: VehicleType.BUS,
    },
    {
      id: "BK-20456",
      tripId: "yangon-bagan-train",
      seatId: "seat-5",
      status: "PENDING",
      reference: "BK-20456",
      departure: "Jan 28, 18:00",
      seatNumber: "C5",
      routeLabel: "Yangon -> Bagan",
      vehicleType: VehicleType.TRAIN,
    },
  ];
}
