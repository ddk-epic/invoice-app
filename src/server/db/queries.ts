import "server-only";

import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  contactsSchema as contactsTable,
  invoiceSchema as invoiceTable,
  productsSchema as productsTable,
} from "./schema";

import { InvoiceData } from "@/constants/types";

export const QUERIES = {
  // SELECT
  getAllContacts: async function () {
    return db.select().from(contactsTable);
  },

  getAllProducts: async function () {
    return db.select().from(productsTable);
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
};