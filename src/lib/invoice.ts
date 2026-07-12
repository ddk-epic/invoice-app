import { Invoice, InvoiceItem } from "@/constants/types";

export function computeInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function canFinalize(draft: Invoice): boolean {
  return draft.items.length > 0;
}
