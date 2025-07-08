import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function idPrefix(id: string) {
  return "INV-" + id.toString().padStart(5, "0");
}

export function centsToEuro(number: number) {
  return (number / 100).toLocaleString("de-DE", {
    currency: "EUR",
    style: "currency",
  });
}

export function deShortDate(date: Date) {
  //date
  const [shortDate] = date
    .toLocaleString("de", {
      timeZone: "Europe/Berlin",
      timeZoneName: "shortOffset",
    })
    .split(",") as string[];

  const [day, month, year] = shortDate.split(".");
  return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}
