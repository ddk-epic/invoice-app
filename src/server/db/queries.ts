import "server-only";

import { eq } from "drizzle-orm";
import { db } from "./index";
import { contactsSchema, invoiceSchema, productsSchema } from "./schema";

import { unstable_cache } from "next/cache";
import { Contact, InvoiceData, InvoiceItem } from "@/constants/types";

export const QUERIES = {
  // SELECT
  getAllContacts: async function () {
    return db.select().from(contactsSchema);
  },

  getAllProducts: async function () {
    return db.select().from(productsSchema);
  },

  getAllInvoices: async function () {
    return db.select().from(invoiceSchema);
  },

  getInvoiceById: async function (id: string) {
    return db
      .select()
      .from(invoiceSchema)
      .where(eq(invoiceSchema.id, parseInt(id)));
  },
};

// dashboard
export const getInvoicesAndContacts = async (): Promise<{
  invoiceList: InvoiceData[];
  contactList: Contact[];
}> => {
  const cacheKey = "invoices-contacts";

  const cached = unstable_cache(
    async () => {
      const [invoices, contacts] = await Promise.all([
        QUERIES.getAllInvoices(),
        QUERIES.getAllContacts(),
      ]);
      const invoiceList = invoices as InvoiceData[];
      const contactList = contacts as Contact[];

      return { invoiceList, contactList };
    },
    [cacheKey],
    {
      tags: [cacheKey],
      revalidate: 60 * 60 * 1, // 1 hour
    }
  );
  return cached();
};

// editor
export const getContactsAndProducts = async (): Promise<{
  contactList: Contact[];
  productList: InvoiceItem[];
}> => {
  const cacheKey = "contacts-products";

  const cached = unstable_cache(
    async () => {
      const [contacts, products] = await Promise.all([
        QUERIES.getAllContacts(),
        QUERIES.getAllProducts(),
      ]);
      const contactList = contacts as Contact[];
      const productList = products as unknown as InvoiceItem[];

      return { contactList, productList };
    },
    [cacheKey],
    {
      tags: [cacheKey],
      revalidate: 60 * 60 * 1, // 1 hour
    }
  );
  return cached();
};
