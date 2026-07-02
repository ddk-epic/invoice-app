import { InvoiceItem } from "@/constants/types";
import type { SelectProductCatalog } from "@/server/db/schema";

// Normalized catalog product. DB numeric columns arrive as strings via drizzle,
// so this coerces them to numbers for app use.
export interface Product {
  id: number;
  gtin: string | null;
  category: string;
  description: string;
  brand: string | null;
  origin: string | null;
  netContent: number;
  contentUnit: string;
  packSize: number | null;
  price: number;
}

export function rowToProduct(row: SelectProductCatalog): Product {
  return {
    id: row.id,
    gtin: row.gtin,
    category: row.category,
    description: row.description,
    brand: row.brand,
    origin: row.origin,
    netContent: Number(row.netContent),
    contentUnit: row.contentUnit,
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

// Adapt a catalog product to the invoice-line shape the editor/PDF still consume.
// quantity/amount are line defaults; the editor recomputes them when an item is added.
export function productToInvoiceItem(p: Product): InvoiceItem {
  return {
    id: p.id,
    category: p.category,
    description: p.description,
    brand: p.brand ?? "",
    origin: p.origin ?? "",
    weight: weightLabel(p),
    perBox: p.packSize ?? 0,
    quantity: 1,
    rate: p.price,
    amount: p.price,
  };
}

export interface Grundpreis {
  value: number;
  unit: string; // "€/kg" | "€/l" | "€/Stk"
}

// Grundpreis per PAngV: reference 1 kg (mass) / 1 l (volume), per piece for Stk.
// Total content of a sellable unit = net_content × pack_size.
export function computeGrundpreis(p: Product): Grundpreis {
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

// Payload for inserting/updating a catalog product. `id` present => update.
export interface ProductInput {
  id?: number;
  gtin?: string | null;
  category: string;
  description: string;
  brand?: string | null;
  origin?: string | null;
  netContent: number;
  contentUnit: string;
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

// Map the editor's InvoiceItem-shaped form back to a catalog ProductInput.
// Unparseable/blank weight falls back to a single piece (1 Stk).
export function invoiceItemToProductInput(item: InvoiceItem): ProductInput {
  const parsed = parseWeight(item.weight) ?? { value: 1, unit: "Stk" };
  return {
    id: item.id && item.id > 0 ? item.id : undefined,
    category: item.category,
    description: item.description,
    brand: item.brand || null,
    origin: item.origin || null,
    netContent: parsed.value,
    contentUnit: parsed.unit,
    packSize: item.perBox ? Number(item.perBox) : null,
    price: Number(item.rate),
  };
}
