// overdue is derived here (open + past due), never stored; the DB keeps only
// draft/open/paid. Paid invoices are excluded from the active work items.

import { InvoiceData } from "@/constants/types";
import { idPrefix } from "@/lib/utils";

export type Derived = "overdue" | "draft" | "open" | "paid";

export interface WorkItem {
  id: number;
  invoiceId: string; // raw number, for the PDF route
  number: string | null; // idPrefix(invoiceId), or null while a draft
  client: string;
  amount: number;
  derived: Derived;
  dueDate: Date;
  invoiceDate: Date;
  updatedAt: Date;
  daysOverdue: number; // >0 only when overdue
}

const MS_PER_DAY = 86_400_000;

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

// paid is excluded here; see buildRecentlyPaid.
function deriveActive(inv: InvoiceData, today: Date): Derived | null {
  if (inv.status === "draft") return "draft";
  if (inv.status === "paid") return null;
  return new Date(inv.dueDate).getTime() < today.getTime() ? "overdue" : "open";
}

function toItem(inv: InvoiceData, derived: Derived, today: Date): WorkItem {
  const due = new Date(inv.dueDate);
  return {
    id: inv.id ?? 0,
    invoiceId: inv.invoiceId,
    number: inv.invoiceId ? idPrefix(inv.invoiceId) : null,
    client: inv.sendTo?.name ?? "—",
    amount: inv.total,
    derived,
    dueDate: due,
    invoiceDate: new Date(inv.invoiceDate),
    updatedAt: new Date(inv.updatedAt),
    daysOverdue: derived === "overdue" ? daysBetween(due, today) : 0,
  };
}

// Drafts first: unfinished don't pay the bills
const URGENCY: Record<Derived, number> = {
  draft: 0,
  overdue: 1,
  open: 2,
  paid: 3,
};

function startOfDay(now: Date) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function buildWorkItems(
  invoices: InvoiceData[],
  now = new Date()
): WorkItem[] {
  const today = startOfDay(now);

  const items = invoices
    .map((inv): WorkItem | null => {
      const derived = deriveActive(inv, today);
      return derived ? toItem(inv, derived, today) : null;
    })
    .filter((x): x is WorkItem => x !== null);

  return items.sort(
    (a, b) =>
      URGENCY[a.derived] - URGENCY[b.derived] ||
      a.dueDate.getTime() - b.dueDate.getTime()
  );
}

// Settled invoices from the last `days` days
export function buildRecentlyPaid(
  invoices: InvoiceData[],
  now = new Date(),
  days = 7
): WorkItem[] {
  const today = startOfDay(now);
  const cutoff = now.getTime() - days * MS_PER_DAY;

  return invoices
    .filter(
      (inv) =>
        inv.status === "paid" && new Date(inv.updatedAt).getTime() >= cutoff
    )
    .map((inv) => toItem(inv, "paid", today))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function groupByDerived(items: WorkItem[]) {
  return {
    draft: items.filter((i) => i.derived === "draft"),
    overdue: items.filter((i) => i.derived === "overdue"),
    open: items.filter((i) => i.derived === "open"),
  };
}

export function sumAmount(items: WorkItem[]) {
  return items.reduce((acc, i) => acc + i.amount, 0);
}
