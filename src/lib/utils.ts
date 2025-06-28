import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toEuro(number: number) {
  return number.toLocaleString("de-DE", { currency: "EUR", style: "currency" });
}
