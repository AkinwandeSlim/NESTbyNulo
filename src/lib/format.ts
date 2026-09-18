/** BigInt kobo → naira number (1 naira = 100 kobo). Never store floats — display only. */
export function koboToNaira(kobo: bigint | number): number {
  return Number(kobo) / 100;
}

/** Formats kobo as ₦ currency string, e.g. 185000000 kobo → "₦1,850,000.00". */
export function formatKobo(kobo: bigint | number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "narrowSymbol",
  }).format(koboToNaira(kobo));
}

/** Status badge colors per screen-spec design patterns (rounded pills). */
export function statusBadgeClass(status: string): string {
  switch (status) {
    case "VERIFIED":
      return "bg-green-100 text-green-800 border-green-300";
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-300";
  }
}
