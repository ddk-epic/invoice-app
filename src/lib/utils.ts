import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function idPrefix(id: string) {
  return "INV-" + id.toString().padStart(5, "0");
}

const UMLAUTS: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "Ae",
  Ö: "Oe",
  Ü: "Ue",
  ß: "ss",
};

function slugForFilename(name: string) {
  return name
    .replace(/[äöüÄÖÜß]/g, (c) => UMLAUTS[c])
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .replace(/-$/, "");
}

export function invoiceFileName(invoiceId: string, client: string) {
  return `Rechnung-${invoiceId.padStart(3, "0")}-${slugForFilename(client)}.pdf`;
}

export function toEuro(number: number) {
  return number.toLocaleString("de-DE", {
    currency: "EUR",
    style: "currency",
  });
}

export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

// Add days to a YYYY-MM-DD date, staying in UTC to avoid DST off-by-one.
export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

export function deShortDate(date: Date | string) {
  // string
  if (typeof date === "string") {
    date = new Date(date);
  }

  //date
  return date.toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
