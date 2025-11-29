"use server";

import { Prisma } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import {
  getFeaturedTrips,
  getTripById,
  getMockBookings,
  searchTrips,
} from "./mockData";
import { sendBookingEmail, sendVerificationEmail } from "./mail";

const searchSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  date: z.string().optional(),
});

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function searchTripsAction(values: unknown) {
  const input = searchSchema.parse(values);
  return searchTrips(input);
}

async function createVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await prisma.verificationToken.upsert({
    where: { token },
    update: { token, expires, identifier: email },
    create: { identifier: email, token, expires },
  });

  return { token, expires };
}

export async function registerUser(values: unknown) {
  const parsed = credentialsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid registration details" };
  }

  const input = parsed.data;
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  if (!hasDatabase) {
    return { success: true, userId: "mock-user-id", message: "DB not set yet" };
  }

  try {
    const passwordHash = await hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        email: input.email.trim().toLowerCase(),
        password: passwordHash,
        name: input.name?.trim(),
      },
    });

    const { token } = await createVerificationToken(user.email!);
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify?token=${token}&email=${encodeURIComponent(
      user.email || "",
    )}`;
    const emailResult = await sendVerificationEmail({ to: user.email || "", verifyUrl });
    if (!emailResult.success) {
      console.warn("Verification email not sent", emailResult.error, verifyUrl);
    }

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("registerUser error", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Email already registered. Try logging in." };
    }

    return { success: false, error: "Registration failed" };
  }
}

export async function loginUser(values: unknown) {
  const input = credentialsSchema.parse(values);
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  if (!hasDatabase) {
    return { success: true, userId: "mock-user-id", message: "DB not set yet" };
  }

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (!user?.password) {
    return { success: false, error: "Invalid credentials" };
  }

  const isValid = await compare(input.password, user.password);
  if (!isValid) {
    return { success: false, error: "Invalid credentials" };
  }

  return { success: true, userId: user.id };
}

export async function verifyEmailToken(token: string, email: string) {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  if (!hasDatabase) {
    return { success: false, error: "Database not configured" };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.identifier !== email) {
    return { success: false, error: "Invalid or expired verification link" };
  }
  if (record.expires < new Date()) {
    return { success: false, error: "Verification link has expired" };
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  return { success: true };
}

export async function createBookingAction(data: {
  tripId: string;
  seatId: string;
  userId: string;
}) {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const reference = `BK-${Math.floor(Math.random() * 90000 + 10000)}`;
  let seatLabelForEmail: string | null = null;
  let tripSummary: { start: string; end: string; departure: string } | null = null;

  if (hasDatabase) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id: data.tripId },
        include: { route: true },
      });
      if (!trip) {
        return { success: false, error: "Trip not found" };
      }
      tripSummary = {
        start: trip.route.startLocation,
        end: trip.route.endLocation,
        departure: trip.departureTime.toISOString(),
      };

      await prisma.$transaction(async (tx) => {
        const seat = await tx.seat.findUnique({
          where: { id: data.seatId },
          select: { seatNumber: true, status: true, tripId: true },
        });
        if (!seat || seat.tripId !== data.tripId) {
          throw new Error("seat_not_found");
        }
        if (seat.status !== "AVAILABLE") {
          throw new Error("seat_unavailable");
        }

        const updated = await tx.seat.updateMany({
          where: { id: data.seatId, tripId: data.tripId, status: "AVAILABLE" },
          data: { status: "BOOKED" },
        });
        if (updated.count === 0) {
          throw new Error("seat_unavailable");
        }

        await tx.booking.create({
          data: {
            userId: data.userId,
            status: "CONFIRMED",
            seatId: data.seatId,
          },
        });

        seatLabelForEmail = seat.seatNumber;
      });
    } catch (error) {
      console.error("createBookingAction error", error);
      if (error instanceof Error) {
        if (error.message === "seat_not_found") {
          return { success: false, error: "Seat not found for this trip." };
        }
        if (error.message === "seat_unavailable") {
          return { success: false, error: "Seat already booked. Choose another seat." };
        }
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return { success: false, error: "Seat already booked. Choose another seat." };
      }
      return { success: false, error: "Booking failed" };
    }
  } else {
    const mockTrip = getTripById(data.tripId);
    if (!mockTrip) {
      return { success: false, error: "Trip not found" };
    }
    tripSummary = {
      start: mockTrip.route.start,
      end: mockTrip.route.end,
      departure: mockTrip.departureTime,
    };
    seatLabelForEmail = data.seatId;
  }

  if (process.env.RESEND_API_KEY) {
    let userEmail: string | null = null;

    if (hasDatabase) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true },
      });
      userEmail = user?.email || null;
    }

    if (userEmail) {
      await sendBookingEmail({
        to: userEmail,
        seatLabel: seatLabelForEmail || data.seatId,
        tripSummary: tripSummary
          ? `${tripSummary.start} -> ${tripSummary.end} at ${tripSummary.departure}`
          : data.tripId,
        reference,
      });
    } else {
      console.warn("Booking email not sent: user email missing");
    }
  }

  return { success: true, reference };
}

export async function getBookingsAction(userId: string) {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  if (hasDatabase) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { seat: { include: { trip: true } } },
    });
    return bookings;
  }
  return getMockBookings();
}

export async function getFeaturedTripsAction() {
  return getFeaturedTrips();
}

export async function confirmBookingPaymentAction(formData: FormData) {
  "use server";
  const bookingId = formData.get("bookingId")?.toString();
  if (!bookingId) {
    return { success: false, error: "Missing booking id" };
  }

  const hasDatabase = Boolean(process.env.DATABASE_URL);
  if (!hasDatabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { seat: true },
    });
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
      if (booking.seat.status !== "BOOKED") {
        await tx.seat.update({
          where: { id: booking.seatId },
          data: { status: "BOOKED" },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/book/${booking.seat.tripId}`);
    return { success: true };
  } catch (error) {
    console.error("confirmBookingPaymentAction error", error);
    return { success: false, error: "Payment confirmation failed" };
  }
}

export async function cancelBookingAction(formData: FormData) {
  "use server";

  const bookingId = formData.get("bookingId")?.toString();
  if (!bookingId) {
    return { success: false, error: "Missing booking id" };
  }

  const hasDatabase = Boolean(process.env.DATABASE_URL);
  if (!hasDatabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { seat: true },
    });
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });
      await tx.seat.update({
        where: { id: booking.seatId },
        data: { status: "AVAILABLE" },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/book/${booking.seat.tripId}`);
    return { success: true };
  } catch (error) {
    console.error("cancelBookingAction error", error);
    return { success: false, error: "Cancel failed" };
  }
}
