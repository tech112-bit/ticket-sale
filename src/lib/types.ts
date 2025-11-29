export enum VehicleType {
  BUS = "BUS",
  TRAIN = "TRAIN",
}

export enum SeatLayout {
  BUS_ONE_PLUS_ONE = "BUS_ONE_PLUS_ONE",
  BUS_TWO_PLUS_ONE = "BUS_TWO_PLUS_ONE",
  BUS_TWO_PLUS_TWO = "BUS_TWO_PLUS_TWO",
  TRAIN_ONE_PLUS_ONE = "TRAIN_ONE_PLUS_ONE",
  TRAIN_TWO_PLUS_ONE = "TRAIN_TWO_PLUS_ONE",
}

export enum SeatStatus {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  RESERVED = "RESERVED",
  UNAVAILABLE = "UNAVAILABLE",
}

export type Trip = {
  id: string;
  operator: string;
  type: VehicleType;
  route: {
    start: string;
    end: string;
  };
  price: number;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  seatLayout: SeatLayout;
  seatsLeft: number;
};

export type TripSearchParams = {
  start?: string;
  end?: string;
  date?: string;
};

export type Seat = {
  id: string;
  seatNumber: string;
  status: SeatStatus;
};

export type BookingFormState = {
  success: boolean;
  error?: string | null;
  reference?: string | null;
};

export type Booking = {
  id: string;
  tripId: string;
  seatId: string;
  status: "RESERVED" | "CONFIRMED" | "PENDING" | "CANCELLED";
  reference: string;
  departure: string;
  seatNumber: string;
  routeLabel: string;
  vehicleType: VehicleType;
};
