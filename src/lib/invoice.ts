import {
  DraftItem,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
} from "@/constants/types";
import type { Product } from "@/lib/products";

// UI-boundary German labels for the internal status.
export const statusLabel: Record<InvoiceStatus, string> = {
  draft: "Entwurf",
  open: "Offen",
  paid: "Bezahlt",
  overdue: "Überfällig",
};

const statusColor: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-800",
  open: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
};

export const getStatusColor = (status: InvoiceStatus) =>
  statusColor[status] ?? "bg-gray-100 text-gray-800";

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
