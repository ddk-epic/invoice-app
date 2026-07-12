import { describe, it, expect } from "vitest";
import type { SelectProductCatalog } from "@/server/db/schema";
import {
  rowToProduct,
  weightLabel,
  computeBasePrice,
  formatBasePrice,
  parseWeight,
  type Product,
} from "./products";

const product = (over: Partial<Product> = {}): Product => ({
  id: 1,
  barcode: null,
  category: "beverage",
  name: "Bier",
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
      barcode: null,
      category: "meat",
      name: "Roastbeef",
      brand: null,
      origin: null,
      netContent: "20.500", // numeric column -> string
      contentUnit: "kg",
      packSize: null,
      price: "276.75",
    } as unknown as SelectProductCatalog;
    const p = rowToProduct(row);
    expect(p).not.toBeNull();
    expect(p!.netContent).toBe(20.5);
    expect(p!.price).toBe(276.75);
    expect(typeof p!.netContent).toBe("number");
  });

  it("returns null for an off-list content unit", () => {
    const row = {
      id: 7,
      barcode: null,
      category: "misc",
      name: "Odd",
      brand: null,
      origin: null,
      netContent: "1.000",
      contentUnit: "oz",
      packSize: null,
      price: "1.00",
    } as unknown as SelectProductCatalog;
    expect(rowToProduct(row)).toBeNull();
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

describe("computeBasePrice (PAngV, ref 1kg / 1l)", () => {
  it("single bottle -> per litre", () => {
    expect(
      computeBasePrice(
        product({ netContent: 330, contentUnit: "ml", price: 1.25 })
      )
    ).toEqual({ value: 3.79, unit: "€/l" });
  });
  it("case row divides by net_content × pack_size (matches the single)", () => {
    // 24 × 330ml = 7.92 l ; 30 / 7.92 = 3.79 €/l
    expect(
      computeBasePrice(
        product({ netContent: 330, contentUnit: "ml", packSize: 24, price: 30 })
      )
    ).toEqual({ value: 3.79, unit: "€/l" });
  });
  it("grams normalise to €/kg", () => {
    expect(
      computeBasePrice(product({ netContent: 500, contentUnit: "g", price: 5 }))
    ).toEqual({ value: 10, unit: "€/kg" });
  });
  it("kg passes through", () => {
    expect(
      computeBasePrice(
        product({ netContent: 20.5, contentUnit: "kg", price: 276.75 })
      )
    ).toEqual({ value: 13.5, unit: "€/kg" });
  });
  it("piece items are priced per Stk", () => {
    expect(
      computeBasePrice(
        product({ contentUnit: "Stk", netContent: 1, price: 2.5 })
      )
    ).toEqual({ value: 2.5, unit: "€/Stk" });
  });
});

describe("formatBasePrice", () => {
  it("formats mass/volume as a German label", () => {
    expect(
      formatBasePrice(product({ netContent: 500, contentUnit: "g", price: 5 }))
    ).toBe("10,00 €/kg");
    expect(
      formatBasePrice(
        product({ netContent: 330, contentUnit: "ml", price: 1.25 })
      )
    ).toBe("3,79 €/l");
  });
  it("is null for piece goods (Stk)", () => {
    expect(
      formatBasePrice(
        product({ contentUnit: "Stk", netContent: 1, price: 2.5 })
      )
    ).toBeNull();
  });
});

describe("parseWeight", () => {
  it("parses value + unit variants", () => {
    expect(parseWeight("330ml")).toEqual({ value: 330, unit: "ml" });
    expect(parseWeight("9,65kg")).toEqual({ value: 9.65, unit: "kg" });
    expect(parseWeight("500gr")).toEqual({ value: 500, unit: "g" });
    expect(parseWeight("25 kg")).toEqual({ value: 25, unit: "kg" });
    expect(parseWeight("2000 Stück")).toEqual({ value: 2000, unit: "Stk" });
  });
  it("returns null for blank/unparseable", () => {
    expect(parseWeight("")).toBeNull();
    expect(parseWeight(null)).toBeNull();
    expect(parseWeight("fair")).toBeNull();
    expect(parseWeight("10")).toBeNull();
  });
});
