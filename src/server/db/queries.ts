import "server-only";

import { eq } from "drizzle-orm";
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

  insertInvoice: async function (invoiceData: InvoiceData) {
    const { id, createdAt, updatedAt, ...rest } = invoiceData;
    const modifiedInvoice = {
      ...rest,
      sender: JSON.stringify(invoiceData.sender),
      sendTo: JSON.stringify(invoiceData.sendTo),
      invoiceTo: JSON.stringify(invoiceData.invoiceTo),
      items: JSON.stringify(invoiceData.items),
    };
    console.log("modified invoice", modifiedInvoice);
    return db.insert(invoiceTable).values(modifiedInvoice);
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
    console.log("newContact", newContact);
    return db.insert(contactsTable).values(newContact);
  },
};
