import { prisma } from "./prisma";
import { SeatLayout, SeatStatus, TripSearchParams, VehicleType } from "./types";
import { formatRoute } from "./utils";
import { getFeaturedTrips, getTripById, getMockBookings, generateSeats } from "./mockData";

const hasDb = Boolean(process.env.DATABASE_URL);

export async function fetchTrips(params: TripSearchParams) {
  if (!hasDb) return getFeaturedTrips();

  try {
    const trips = await prisma.trip.findMany({
      where: {
        route: {
          startLocation: params.start
            ? { contains: params.start, mode: "insensitive" }
            : undefined,
          endLocation: params.end
            ? { contains: params.end, mode: "insensitive" }
            : undefined,
        },
      },
      include: { route: true, vehicle: true, seats: true },
      orderBy: { departureTime: "asc" },
      take: 20,
    });

    return trips.map((trip) => ({
      id: trip.id,
      operator: trip.vehicle.operator,
      type: trip.vehicle.type as VehicleType,
      route: {
        start: trip.route.startLocation,
        end: trip.route.endLocation,
      },
      price: trip.price,
      departureTime: trip.departureTime.toISOString(),
      arrivalTime: trip.arrivalTime.toISOString(),
      durationLabel: "",
      seatLayout: trip.vehicle.seatLayout as SeatLayout,
      seatsLeft: trip.seats.filter((s) => s.status === SeatStatus.AVAILABLE).length,
    }));
  } catch (error) {
    console.error("fetchTrips error, falling back to mock", error);
    return getFeaturedTrips();
  }
}

export async function fetchTripWithSeats(tripId: string) {
  if (!hasDb) {
    const mock = getTripById(tripId);
    if (!mock) return null;
    const seats = generateSeats(undefined, mock.seatLayout);

    return {
      id: mock.id,
      operator: mock.operator,
      type: mock.type,
      routeLabel: formatRoute(mock.route.start, mock.route.end),
      price: mock.price,
      departureTime: mock.departureTime,
      arrivalTime: mock.arrivalTime,
      durationLabel: mock.durationLabel,
      seatsLeft: seats.filter((s) => s.status === SeatStatus.AVAILABLE).length,
      seatLayout: mock.seatLayout,
      seats: seats.map((seat) => ({
        id: seat.id,
        label: seat.seatNumber,
        status: seat.status,
      })),
    };
  }

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { route: true, vehicle: true, seats: true },
    });
    if (!trip) return null;

    return {
      id: trip.id,
      operator: trip.vehicle.operator,
      type: trip.vehicle.type as VehicleType,
      routeLabel: formatRoute(trip.route.startLocation, trip.route.endLocation),
      price: trip.price,
      departureTime: trip.departureTime.toISOString(),
      arrivalTime: trip.arrivalTime.toISOString(),
      durationLabel: "",
      seatsLeft: trip.seats.filter((s) => s.status === SeatStatus.AVAILABLE).length,
      seatLayout: trip.vehicle.seatLayout as SeatLayout,
      seats: trip.seats.map((seat) => ({
        id: seat.id,
        label: seat.seatNumber,
        status: seat.status as SeatStatus,
      })),
    };
  } catch (error) {
    console.error("fetchTripWithSeats error", error);
    return null;
  }
}

export async function fetchBookings(userId?: string) {
  if (!hasDb || !userId) return getMockBookings();

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        seat: {
          include: { trip: { include: { route: true, vehicle: true } } },
        },
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      tripId: booking.seat.tripId,
      seatId: booking.seatId,
      status: booking.status as "RESERVED" | "CONFIRMED" | "PENDING" | "CANCELLED",
      reference: booking.id,
      departure: booking.seat.trip.departureTime.toISOString(),
      seatNumber: booking.seat.seatNumber,
      routeLabel: formatRoute(
        booking.seat.trip.route.startLocation,
        booking.seat.trip.route.endLocation,
      ),
      vehicleType: booking.seat.trip.vehicle.type as VehicleType,
    }));
  } catch (error) {
    console.error("fetchBookings error, falling back to mock", error);
    return getMockBookings();
  }
}

export { hasDb };
