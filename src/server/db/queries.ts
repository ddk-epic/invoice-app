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
  Invoice,
  InvoiceData,
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
    gtin: p.gtin ?? null,
    category: p.category,
    description: p.description,
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
function invoiceDataToRow(inv: InvoiceData) {
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

  // Full invoice history for the /invoice list.
  getAllInvoices: async function (): Promise<Invoice[]> {
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
      .orderBy(desc(invoiceTable.createdAt));
  },

  // Dashboard slice: all unpaid work (any age) plus invoices settled in the
  // last 7 days. Projects only the columns the work-item builders read - the
  // jsonb contact/items blobs never leave the DB; `client` is the sender name
  // pulled from the send_to snapshot.
  //
  // The window filters on updated_at, which equals the settle time only because
  // markPaidById is the sole write to a paid row and paid rows are never touched
  // again. If a second write path to paid appears, add a dedicated paid_at
  // column - this assumption is load-bearing.
  //
  // The window uses the DB clock (now()); buildRecentlyPaid re-filters with the
  // app clock. The sub-second difference between the two is accepted.
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
  ): Promise<InvoiceData | undefined> {
    const [row] = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.invoiceId, invoiceId))
      .limit(1);
    return row;
  },

  getDraftById: async function (id: number): Promise<InvoiceData | undefined> {
    const [row] = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.id, id));
    return row;
  },

  insertDraft: async function (inv: InvoiceData) {
    const [row] = await db
      .insert(invoiceTable)
      .values(invoiceDataToRow(inv))
      .returning({ id: invoiceTable.id });
    return row;
  },

  updateDraftById: async function (id: number, inv: InvoiceData) {
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
                        FROM invoice_table WHERE status <> 'draft')`,
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
