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
