import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "./index";
import {
  contactsSchema as contactsTable,
  invoiceSchema as invoiceTable,
  privateSchema as privateTable,
  productCatalogSchema as productCatalogTable,
} from "./schema";

import { BaseContact, InvoiceData } from "@/constants/types";
import type { ProductInput } from "@/lib/products";

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
  getPrivateContact: async function () {
    return db.select().from(privateTable);
  },

  getAllContacts: async function () {
    return db.select().from(contactsTable);
  },

  getAllProducts: async function () {
    return db.select().from(productCatalogTable);
  },

  getAllInvoices: async function () {
    return db.select().from(invoiceTable);
  },

  getInvoiceById: async function (invoiceId: string) {
    return db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.invoiceId, invoiceId));
  },

  getDraftById: async function (id: number) {
    return db.select().from(invoiceTable).where(eq(invoiceTable.id, id));
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

  updateContact: async function (newContact: BaseContact) {
    return db.insert(contactsTable).values(newContact);
  },
};
