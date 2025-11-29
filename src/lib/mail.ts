import { Resend } from "resend";

const resend =
  process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 0
    ? new Resend(process.env.RESEND_API_KEY)
    : null;
const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

type BookingEmailInput = {
  to: string;
  seatLabel: string;
  tripSummary: string;
  reference: string;
};

type VerificationEmailInput = {
  to: string;
  verifyUrl: string;
};

export async function sendBookingEmail(input: BookingEmailInput) {
  if (!resend) {
    return {
      success: false,
      error: "Resend is not configured yet.",
    };
  }

  try {
    await resend.emails.send({
      from: fromAddress,
      to: input.to,
      subject: `Booking confirmation ${input.reference}`,
      text: `Your seat ${input.seatLabel} is confirmed for ${input.tripSummary}. Reference: ${input.reference}.`,
    });
    return { success: true };
  } catch (error) {
    console.error("sendBookingEmail error", error);
    return { success: false, error: "Email send failed" };
  }
}

export async function sendVerificationEmail(input: VerificationEmailInput) {
  if (!resend) {
    return {
      success: false,
      error: "Resend is not configured yet.",
    };
  }

  try {
    await resend.emails.send({
      from: fromAddress,
      to: input.to,
      subject: "Verify your email for Myanmar Transit",
      text: `Welcome! Please verify your email by opening this link: ${input.verifyUrl}`,
    });
    return { success: true };
  } catch (error) {
    console.error("sendVerificationEmail error", error);
    return { success: false, error: "Verification email send failed" };
  }
}
