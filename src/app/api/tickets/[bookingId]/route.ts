import { NextRequest, NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data";

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfTicket({
  reference,
  routeLabel,
  seat,
  departure,
  status,
}: {
  reference: string;
  routeLabel: string;
  seat: string;
  departure: string;
  status: string;
}) {
  const lines = [
    `Ticket ${reference}`,
    routeLabel,
    `Seat: ${seat}`,
    `Departure: ${departure}`,
    `Status: ${status}`,
  ].join(" | ");
  const content = `BT /F1 12 Tf 50 750 Td (${escapePdfText(lines)}) Tj ET`;

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
  );
  objects.push(
    `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
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
  const bookings = await fetchBookings();
  const booking =
    bookings.find((b) => b.id === bookingId) ||
    bookings.find((b) => b.reference === bookingId);

  if (!booking) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const pdf = buildPdfTicket({
    reference: booking.reference,
    routeLabel: booking.routeLabel,
    seat: booking.seatNumber,
    departure: booking.departure,
    status: booking.status,
  });

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticket-${booking.reference}.pdf"`,
    },
  });
}
