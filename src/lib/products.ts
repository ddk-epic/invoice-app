import type { InvoiceItem } from "@/constants/types";
import type { SelectProductCatalog } from "@/server/db/schema";

export const CONTENT_UNITS = ["g", "kg", "ml", "l", "Stk"] as const;
export type ContentUnit = (typeof CONTENT_UNITS)[number];

// Normalized catalog product. DB numeric columns arrive as strings via drizzle,
// so this coerces them to numbers for app use.
export interface Product {
  id: number;
  barcode: string | null; // EAN-13 / GTIN
  category: string;
  name: string;
  brand: string | null;
  origin: string | null;
  netContent: number;
  contentUnit: ContentUnit;
  packSize: number | null;
  price: number;
}

export function rowToProduct(row: SelectProductCatalog): Product {
  return {
    id: row.id,
    barcode: row.barcode,
    category: row.category,
    name: row.name,
    brand: row.brand,
    origin: row.origin,
    netContent: Number(row.netContent),
    contentUnit: row.contentUnit as ContentUnit,
    packSize: row.packSize,
    price: Number(row.price),
  };
}

// Human weight label, matching the legacy free-text `weight` (e.g. "330ml").
// Piece-priced items (Stk) carry no weight label.
export function weightLabel(p: Product): string {
  if (p.contentUnit === "Stk") return "";
  return `${p.netContent}${p.contentUnit}`;
}

// A picked product becomes an invoice line: the same fields plus a default
// quantity/amount. The editor recomputes quantity/amount as the line is edited.
export function productToInvoiceItem(p: Product): InvoiceItem {
  return { ...p, quantity: 1, amount: p.price };
}

export interface BasePrice {
  value: number;
  unit: string; // "€/kg" | "€/l" | "€/Stk"
}

// PAngV Grundpreis: reference 1 kg (mass) / 1 l (volume), per piece for Stk.
// Total content of a sellable unit = net_content × pack_size.
export function computeBasePrice(p: Product): BasePrice {
  const packs = p.packSize && p.packSize > 0 ? p.packSize : 1;
  const round2 = (n: number) => Math.round(n * 100) / 100;

  if (p.contentUnit === "g" || p.contentUnit === "kg") {
    const kg =
      (p.contentUnit === "kg" ? p.netContent : p.netContent / 1000) * packs;
    return { value: round2(p.price / kg), unit: "€/kg" };
  }
  if (p.contentUnit === "ml" || p.contentUnit === "l") {
    const l =
      (p.contentUnit === "l" ? p.netContent : p.netContent / 1000) * packs;
    return { value: round2(p.price / l), unit: "€/l" };
  }
  return { value: round2(p.price / packs), unit: "€/Stk" };
}

// German-formatted Grundpreis label ("3,03 €/kg"). Null for piece goods (Stk),
// which PAngV doesn't require and where €/Stk just restates the price.
export function formatBasePrice(p: Product): string | null {
  if (p.contentUnit === "Stk") return null;
  const { value, unit } = computeBasePrice(p);
  const formatted = value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${unit}`;
}

// Payload for inserting/updating a catalog product. `id` present => update.
export interface ProductInput {
  id?: number;
  barcode?: string | null;
  category: string;
  name: string;
  brand?: string | null;
  origin?: string | null;
  netContent: number;
  contentUnit: ContentUnit;
  packSize?: number | null;
  price: number;
}

const WEIGHT_UNIT: Record<string, string> = {
  g: "g",
  gr: "g",
  mg: "g",
  kg: "kg",
  ml: "ml",
  l: "l",
  ltr: "l",
};

// Parse a free-text weight ("330ml", "9,65kg", "2000 Stück") into value + unit.
// Returns null when empty or unrecognised (caller decides the fallback).
export function parseWeight(
  raw: string | null | undefined
): { value: number; unit: string } | null {
  if (raw == null) return null;
  let w = String(raw).trim().toLowerCase();
  if (w === "") return null;
  w = w.replace(",", ".").replace(/\s+/g, "");
  const piece = w.match(/^([\d.]+)(stück|stuck|stk)$/);
  if (piece) return { value: Number(piece[1]), unit: "Stk" };
  const m = w.match(/^([\d.]+)(mg|kg|gr|g|ml|ltr|l)$/);
  if (!m) return null;
  const value = Number(m[1]);
  const unit = WEIGHT_UNIT[m[2]];
  if (!unit || Number.isNaN(value)) return null;
  return { value, unit };
}
