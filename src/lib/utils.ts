import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// for editor price display
export function centsToEuro(number: number) {
  return (number / 100).toLocaleString("de-DE", {
    currency: "EUR",
    style: "currency",
  });
}

export function idPrefix(id: number) {
  return "INV-" + id.toString().padStart(5, "0");
}
