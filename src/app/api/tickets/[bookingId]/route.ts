import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchBookings } from "@/lib/data";
import { formatRoute } from "@/lib/utils";

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfTicket({
  reference,
  routeLabel,
  seat,
  departure,
  status,
  travelerName,
  issuedAt,
}: {
  reference: string;
  routeLabel: string;
  seat: string;
  departure: string;
  status: string;
  travelerName: string;
  issuedAt?: string;
}) {
  const issued = issuedAt || new Date().toISOString();
  const line = (
    text: string,
    x: number,
    y: number,
    size = 12,
    font: "F1" | "F2" = "F1",
  ) => `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;

  // Simple layout with consistent line spacing and monospace look
  const startY = 540;
  const step = 22;
  const sep = "----------------------------------------";
  const content = [
    line("TICKET RECEIPT", 16, startY, 16, "F2"),
    line(routeLabel, 16, startY - step, 12, "F1"),
    line(sep, 16, startY - step * 2, 10, "F1"),
    line(`Passenger: ${travelerName}`, 16, startY - step * 3, 12, "F1"),
    line(`Seat: ${seat}`, 16, startY - step * 4, 12, "F1"),
    line(`Departure: ${departure}`, 16, startY - step * 5, 12, "F1"),
    line(`Status: ${status}`, 16, startY - step * 6, 12, "F1"),
    line(`Reference: ${reference}`, 16, startY - step * 7, 12, "F1"),
    line(`Issued: ${issued}`, 16, startY - step * 8, 10, "F1"),
    line(sep, 16, startY - step * 9, 10, "F1"),
    line("Thank you for riding with us!", 16, startY - step * 10, 12, "F2"),
  ].join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 580] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n",
  );
  objects.push(
    `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  );
  objects.push(
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>\nendobj\n",
  );

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${pdf.length}\n%%EOF`;
  return pdf;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;
  if (!bookingId) {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasDatabase = Boolean(process.env.DATABASE_URL);
  let booking:
    | {
        reference: string;
        routeLabel: string;
        seatNumber: string;
        departure: string;
        status: string;
        travelerName: string;
        issuedAt?: string;
      }
    | null = null;

  if (hasDatabase) {
    try {
      const dbBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          seat: {
            include: { trip: { include: { route: true, vehicle: true } } },
          },
          ticket: true,
          user: { select: { name: true, email: true } },
        },
      });

      if (dbBooking && dbBooking.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (dbBooking) {
        booking = {
          reference: dbBooking.ticket?.reference || dbBooking.id,
          routeLabel: formatRoute(
            dbBooking.seat.trip.route.startLocation,
            dbBooking.seat.trip.route.endLocation,
          ),
          seatNumber: dbBooking.seat.seatNumber,
          departure: dbBooking.seat.trip.departureTime.toISOString(),
          status: dbBooking.ticket?.status || dbBooking.status,
          travelerName:
            dbBooking.user?.name ||
            session?.user?.name ||
            dbBooking.user?.email ||
            "Traveler",
          issuedAt: dbBooking.ticket?.issuedAt?.toISOString(),
        };
      }
    } catch (error) {
      console.warn("[ticket] falling back to mock fetch", error);
    }
  }

  if (!booking) {
    const bookings = await fetchBookings(userId);
    const fallback =
      bookings.find((b) => b.id === bookingId) ||
      bookings.find((b) => b.reference === bookingId);
    if (fallback) {
      booking = {
        reference: fallback.reference,
        routeLabel: fallback.routeLabel,
        seatNumber: fallback.seatNumber,
        departure: fallback.departure,
        status: fallback.status,
        travelerName: session?.user?.name || "Traveler",
        issuedAt: undefined,
      };
    }
  }

  if (!booking) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const pdf = buildPdfTicket({
    reference: booking.reference,
    routeLabel: booking.routeLabel,
    seat: booking.seatNumber,
    departure: booking.departure,
    status: booking.status,
    travelerName: booking.travelerName,
    issuedAt: booking.issuedAt,
  });

  const safeName = (booking.reference || "ticket").replace(/[^\w.-]+/g, "_");
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticket-${safeName}.pdf"`,
    },
  });
}
