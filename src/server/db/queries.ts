import "server-only";

import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  contactsSchema as contactsTable,
  invoiceSchema as invoiceTable,
  privateSchema as privateTable,
  productsSchema as productsTable,
} from "./schema";

import {
  BaseContact,
  BaseInvoiceItem,
  InvoiceData,
  InvoiceItem,
} from "@/constants/types";

export const QUERIES = {
  // SELECT
  getPrivateContact: async function () {
    return db.select().from(privateTable);
  },

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

  updateProduct: async function (
    productList: InvoiceItem[],
    newItem: InvoiceItem
  ) {
    console.log("newItem", newItem);

    productList.push(newItem);

    const updatedProductList = {
      id: 1,
      categoryName: "all",
      categoryJson: JSON.stringify(productList),
    };

    return db
      .update(productsTable)
      .set(updatedProductList)
      .where(eq(productsTable.categoryName, "all"));
  },

  updateContact: async function (newContact: BaseContact) {
    console.log("newContact", newContact);
    return db.insert(contactsTable).values(newContact);
  },
};
