import { InvoiceItem } from "@/constants/types";

export function computeInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}
