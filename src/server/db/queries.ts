import "server-only";

import { and, desc, eq, gte, ne, or, sql } from "drizzle-orm";
import { db } from "./index";
import {
  contactsSchema as contactsTable,
  invoiceSchema as invoiceTable,
  privateSchema as privateTable,
  productCatalogSchema as productCatalogTable,
  type SelectContact,
} from "./schema";

import {
  BaseContact,
  Contact,
  InvoiceRow,
  Invoice,
  LatestInvoice,
  PrivateContact,
} from "@/constants/types";
import type { ProductInput } from "@/lib/products";

function rowToContact(row: SelectContact): Contact {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    owner: row.owner ?? undefined,
    address: row.address,
  };
}

// Map an app-level ProductInput to a DB row (numeric columns are strings in drizzle).
function productInputToRow(p: ProductInput) {
  return {
    barcode: p.barcode ?? null,
    category: p.category,
    name: p.name,
    brand: p.brand ?? null,
    origin: p.origin ?? null,
    netContent: String(p.netContent),
    contentUnit: p.contentUnit,
    packSize: p.packSize ?? null,
    price: String(p.price),
  };
}

// jsonb columns take objects directly - drizzle serializes them; do NOT
// pre-stringify (that double-encodes).
function invoiceDataToRow(inv: Invoice) {
  return {
    invoiceId: inv.invoiceId,
    invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate,
    status: inv.status,
    sender: inv.sender,
    sendTo: inv.sendTo,
    invoiceTo: inv.invoiceTo,
    items: inv.items,
    total: inv.total,
    taxRate: inv.taxRate,
  };
}

export const QUERIES = {
  // SELECT
  getPrivateContact: async function (): Promise<PrivateContact[]> {
    return db.select().from(privateTable);
  },

  getAllContacts: async function (): Promise<Contact[]> {
    const rows = await db.select().from(contactsTable);
    return rows.map(rowToContact);
  },

  getAllProducts: async function () {
    return db.select().from(productCatalogTable);
  },

  countInvoices: async function (): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoiceTable);
    return row?.count ?? 0;
  },

  // One page of the /invoice list, newest first. Kept separate from
  // countInvoices so the read boundary can short-circuit on an out-of-range page.
  getInvoicesPage: async function (
    page: number,
    pageSize: number
  ): Promise<InvoiceRow[]> {
    return db
      .select({
        id: invoiceTable.id,
        invoiceId: invoiceTable.invoiceId,
        status: invoiceTable.status,
        total: invoiceTable.total,
        createdAt: invoiceTable.createdAt,
        client: sql<string>`coalesce(${invoiceTable.sendTo} ->> 'name', '—')`,
      })
      .from(invoiceTable)
      .orderBy(desc(invoiceTable.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  },

  // Unpaid work (any age) plus invoices settled in the last 7 days.
  // Window filters on updated_at, which equals settle time only because
  // markPaidById is the sole write to a paid row: add a paid_at column if a
  // second write path to paid appears.
  // Window uses the DB clock; buildRecentlyPaid re-filters with the app clock,
  // sub-second drift accepted.
  getLatestInvoices: async function (): Promise<LatestInvoice[]> {
    return db
      .select({
        id: invoiceTable.id,
        invoiceId: invoiceTable.invoiceId,
        status: invoiceTable.status,
        invoiceDate: invoiceTable.invoiceDate,
        dueDate: invoiceTable.dueDate,
        updatedAt: invoiceTable.updatedAt,
        total: invoiceTable.total,
        client: sql<string>`coalesce(${invoiceTable.sendTo} ->> 'name', '—')`,
      })
      .from(invoiceTable)
      .where(
        or(
          ne(invoiceTable.status, "paid"),
          gte(invoiceTable.updatedAt, sql`now() - interval '7 days'`)
        )
      );
  },

  getInvoiceById: async function (
    invoiceId: string
  ): Promise<Invoice | undefined> {
    const [row] = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.invoiceId, invoiceId))
      .limit(1);
    return row;
  },

  getDraftById: async function (id: number): Promise<Invoice | undefined> {
    const [row] = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.id, id));
    return row;
  },

  insertDraft: async function (inv: Invoice) {
    const [row] = await db
      .insert(invoiceTable)
      .values(invoiceDataToRow(inv))
      .returning({ id: invoiceTable.id });
    return row;
  },

  updateDraftById: async function (id: number, inv: Invoice) {
    return db
      .update(invoiceTable)
      .set(invoiceDataToRow(inv))
      .where(eq(invoiceTable.id, id));
  },

  // Assign the next sequential issued number and flip to open, atomically.
  // The SET subquery sees the pre-update table, so this still-draft row is excluded.
  submitDraft: async function (id: number) {
    const [row] = await db
      .update(invoiceTable)
      .set({
        invoiceId: sql`(SELECT COALESCE(MAX((invoice_id)::int), 0) + 1
                        FROM invoice_invoices WHERE status <> 'draft')`,
        status: "open",
      })
      .where(eq(invoiceTable.id, id))
      .returning({ invoiceId: invoiceTable.invoiceId });
    return row;
  },

  deleteDraftById: async function (id: number) {
    return db.delete(invoiceTable).where(eq(invoiceTable.id, id));
  },

  // overdue is derived at read time; a late invoice is still stored 'open'.
  // Match on status so only issued invoices settle, never drafts.
  markPaidById: async function (id: number) {
    return db
      .update(invoiceTable)
      .set({ status: "paid" })
      .where(and(eq(invoiceTable.id, id), eq(invoiceTable.status, "open")));
  },

  insertProduct: async function (p: ProductInput) {
    return db.insert(productCatalogTable).values(productInputToRow(p));
  },

  updateProduct: async function (id: number, p: ProductInput) {
    return db
      .update(productCatalogTable)
      .set(productInputToRow(p))
      .where(eq(productCatalogTable.id, id));
  },

  insertContact: async function (newContact: BaseContact) {
    return db.insert(contactsTable).values(newContact);
  },

  updateContact: async function (id: number, contact: BaseContact) {
    return db
      .update(contactsTable)
      .set(contact)
      .where(eq(contactsTable.id, id));
  },
};
