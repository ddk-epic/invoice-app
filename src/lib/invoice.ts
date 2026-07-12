import { DraftItem, Invoice, InvoiceItem } from "@/constants/types";
import type { Product } from "@/lib/products";

export function resolveItem(item: DraftItem, product: Product): InvoiceItem {
  return {
    ...product,
    quantity: item.quantity,
    amount: item.quantity * product.price,
  };
}

export function computeTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function canFinalize(draft: Invoice): boolean {
  return draft.items.length > 0;
}
