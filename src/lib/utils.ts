export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatRoute(start: string, end: string) {
  return `${start} -> ${end}`;
}
