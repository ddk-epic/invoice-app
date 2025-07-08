"use server";

import { Contact, InvoiceData, InvoiceItem } from "@/constants/types";
import { InvoiceSchema } from "@/lib/schema";
import { QUERIES } from "@/server/db/queries";
import { revalidatePath, unstable_cache } from "next/cache";

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
      revalidate: 60 * 1, // 1 minute(s)
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
      revalidate: 60 * 1, // 1 minute(s)
    }
  );
  return cached();
};

export const getCachedInvoiceData = async (invoiceId: string) => {
  const cacheKey = `invoice-cache-${invoiceId}`;
  const cached = unstable_cache(
    async (invoiceId) => QUERIES.getInvoiceById(invoiceId),
    [cacheKey],
    {
      tags: [cacheKey],
      revalidate: 60 * 1, // 1 minute(s)
    }
  );
  return cached(invoiceId);
};

export const insertInvoiceAction = async (invoiceData: InvoiceData) => {
  try {
    const result = InvoiceSchema.safeParse(invoiceData);
    if (!result.success) return console.log(result.error);

    const insertedInvoice = await QUERIES.insertInvoice(invoiceData);
    if (insertedInvoice) console.log("successfully saved to the database!");
    revalidatePath("/dashboard");
    return 1;
  } catch (err) {
    console.error("Server action error:", err);
    throw new Error("Internal Server Error");
  }
};
