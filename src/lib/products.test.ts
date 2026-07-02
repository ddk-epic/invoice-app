import { describe, it, expect } from "vitest";
import type { SelectProductCatalog } from "@/server/db/schema";
import {
  rowToProduct,
  weightLabel,
  productToInvoiceItem,
  computeGrundpreis,
  type Product,
} from "./products";

const product = (over: Partial<Product> = {}): Product => ({
  id: 1,
  gtin: null,
  category: "beverage",
  description: "Bier",
  brand: "Tsingtao",
  origin: null,
  netContent: 330,
  contentUnit: "ml",
  packSize: null,
  price: 1.25,
  ...over,
});

describe("rowToProduct", () => {
  it("coerces DB string numerics to numbers", () => {
    const row = {
      id: 5,
      gtin: null,
      category: "meat",
      description: "Roastbeef",
      brand: null,
      origin: null,
      netContent: "20.500", // numeric column -> string
      contentUnit: "kg",
      packSize: null,
      price: "276.75",
    } as unknown as SelectProductCatalog;
    const p = rowToProduct(row);
    expect(p.netContent).toBe(20.5);
    expect(p.price).toBe(276.75);
    expect(typeof p.netContent).toBe("number");
  });
});

describe("weightLabel", () => {
  it("formats value + unit", () => {
    expect(weightLabel(product({ netContent: 330, contentUnit: "ml" }))).toBe(
      "330ml"
    );
    expect(weightLabel(product({ netContent: 1, contentUnit: "kg" }))).toBe(
      "1kg"
    );
  });
  it("is empty for piece-priced (Stk) items", () => {
    expect(weightLabel(product({ contentUnit: "Stk", netContent: 1 }))).toBe(
      ""
    );
  });
});

describe("productToInvoiceItem", () => {
  it("maps price -> rate/amount and pack_size -> perBox", () => {
    const item = productToInvoiceItem(product({ price: 30, packSize: 24 }));
    expect(item.rate).toBe(30);
    expect(item.amount).toBe(30);
    expect(item.perBox).toBe(24);
    expect(item.quantity).toBe(1);
  });
  it("defaults null brand/pack to safe values", () => {
    const item = productToInvoiceItem(product({ brand: null, packSize: null }));
    expect(item.brand).toBe("");
    expect(item.perBox).toBe(0);
  });
});

describe("computeGrundpreis (PAngV, ref 1kg / 1l)", () => {
  it("single bottle -> per litre", () => {
    expect(
      computeGrundpreis(
        product({ netContent: 330, contentUnit: "ml", price: 1.25 })
      )
    ).toEqual({ value: 3.79, unit: "€/l" });
  });
  it("case row divides by net_content × pack_size (matches the single)", () => {
    // 24 × 330ml = 7.92 l ; 30 / 7.92 = 3.79 €/l
    expect(
      computeGrundpreis(
        product({ netContent: 330, contentUnit: "ml", packSize: 24, price: 30 })
      )
    ).toEqual({ value: 3.79, unit: "€/l" });
  });
  it("grams normalise to €/kg", () => {
    expect(
      computeGrundpreis(
        product({ netContent: 500, contentUnit: "g", price: 5 })
      )
    ).toEqual({ value: 10, unit: "€/kg" });
  });
  it("kg passes through", () => {
    expect(
      computeGrundpreis(
        product({ netContent: 20.5, contentUnit: "kg", price: 276.75 })
      )
    ).toEqual({ value: 13.5, unit: "€/kg" });
  });
  it("piece items are priced per Stk", () => {
    expect(
      computeGrundpreis(
        product({ contentUnit: "Stk", netContent: 1, price: 2.5 })
      )
    ).toEqual({ value: 2.5, unit: "€/Stk" });
  });
});
