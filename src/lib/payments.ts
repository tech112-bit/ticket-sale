import { PaymentMethod } from "@prisma/client";

export const PAYMENT_OPTIONS: { label: string; value: PaymentMethod }[] = [
  { label: "Card", value: PaymentMethod.CARD },
  { label: "KPay", value: PaymentMethod.KPAY },
  { label: "Wave Pay", value: PaymentMethod.WAVE },
];

export const DEFAULT_PAYMENT_METHOD = PaymentMethod.CARD;
