import { describe, it, expect } from "vitest";
import type { DraftItem } from "@/constants/types";
import { addProduct, setQuantity, removeProduct } from "./invoice-items";

describe("addProduct", () => {
  it("appends a new product at quantity 1", () => {
    expect(addProduct([], 7)).toEqual([{ productId: 7, quantity: 1 }]);
  });

  it("bumps quantity instead of duplicating an existing product", () => {
    const items: DraftItem[] = [{ productId: 7, quantity: 2 }];
    expect(addProduct(items, 7)).toEqual([{ productId: 7, quantity: 3 }]);
  });

  it("preserves order and other lines when bumping", () => {
    const items: DraftItem[] = [
      { productId: 3, quantity: 1 },
      { productId: 7, quantity: 1 },
    ];
    expect(addProduct(items, 3)).toEqual([
      { productId: 3, quantity: 2 },
      { productId: 7, quantity: 1 },
    ]);
  });

  it("does not mutate the input", () => {
    const items: DraftItem[] = [{ productId: 7, quantity: 1 }];
    addProduct(items, 7);
    expect(items).toEqual([{ productId: 7, quantity: 1 }]);
  });
});

describe("setQuantity", () => {
  it("sets the quantity for the matching product", () => {
    const items: DraftItem[] = [{ productId: 7, quantity: 1 }];
    expect(setQuantity(items, 7, 5)).toEqual([{ productId: 7, quantity: 5 }]);
  });

  it("clamps to a floor of 1", () => {
    const items: DraftItem[] = [{ productId: 7, quantity: 3 }];
    expect(setQuantity(items, 7, 0)).toEqual([{ productId: 7, quantity: 1 }]);
    expect(setQuantity(items, 7, -4)).toEqual([{ productId: 7, quantity: 1 }]);
  });

  it("floors fractional input", () => {
    const items: DraftItem[] = [{ productId: 7, quantity: 1 }];
    expect(setQuantity(items, 7, 2.9)).toEqual([{ productId: 7, quantity: 2 }]);
  });

  it("leaves other products untouched", () => {
    const items: DraftItem[] = [
      { productId: 3, quantity: 1 },
      { productId: 7, quantity: 1 },
    ];
    expect(setQuantity(items, 7, 4)).toEqual([
      { productId: 3, quantity: 1 },
      { productId: 7, quantity: 4 },
    ]);
  });
});

describe("removeProduct", () => {
  it("drops the whole line for the product", () => {
    const items: DraftItem[] = [
      { productId: 3, quantity: 1 },
      { productId: 7, quantity: 2 },
    ];
    expect(removeProduct(items, 7)).toEqual([{ productId: 3, quantity: 1 }]);
  });

  it("is a no-op when the product is absent", () => {
    const items: DraftItem[] = [{ productId: 3, quantity: 1 }];
    expect(removeProduct(items, 7)).toEqual([{ productId: 3, quantity: 1 }]);
  });
});
