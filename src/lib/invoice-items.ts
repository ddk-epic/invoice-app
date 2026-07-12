import type { DraftItem } from "@/constants/types";

export function addProduct(items: DraftItem[], productId: number): DraftItem[] {
  const index = items.findIndex((i) => i.productId === productId);
  if (index === -1) return [...items, { productId, quantity: 1 }];
  return items.map((i, n) =>
    n === index ? { ...i, quantity: i.quantity + 1 } : i
  );
}

export function setQuantity(
  items: DraftItem[],
  productId: number,
  quantity: number
): DraftItem[] {
  const clamped = Math.max(1, Math.floor(quantity));
  return items.map((i) =>
    i.productId === productId ? { ...i, quantity: clamped } : i
  );
}

export function removeProduct(
  items: DraftItem[],
  productId: number
): DraftItem[] {
  return items.filter((i) => i.productId !== productId);
}
