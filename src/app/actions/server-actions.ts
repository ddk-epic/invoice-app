"use server";

import { revalidatePath, unstable_cache } from "next/cache";

import { InvoiceSchema } from "@/lib/schema";
import { QUERIES } from "@/server/db/queries";

import { Contact, InvoiceData, InvoiceItem } from "@/constants/types";

const revalidationTime = 60 * 5; // 5 minute(s)

type ParseProduct = {
  id?: number;
  categoryName: string;
  categoryJson: unknown;
}[];

const parseProductJson = (productList: ParseProduct): InvoiceItem[] => {
  return productList.flatMap((product) => {
    return (product.categoryJson as InvoiceItem[][]).flat();
  });
};

// dashboard
export const getInvoicesContactsProducts = async (): Promise<{
  invoiceList: InvoiceData[];
  contactList: Contact[];
  productList: InvoiceItem[];
}> => {
  const cacheKey = "invoices-contacts";

  const cached = unstable_cache(
    async () => {
      const [invoices, contacts, products] = await Promise.all([
        QUERIES.getAllInvoices(),
        QUERIES.getAllContacts(),
        QUERIES.getAllProducts(),
      ]);
      const invoiceList = invoices as InvoiceData[];
      const contactList = contacts as Contact[];
      const productList = parseProductJson(products);

      return { invoiceList, contactList, productList };
    },
    [cacheKey],
    {
      tags: [cacheKey],
      revalidate: revalidationTime,
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
      const productList = parseProductJson(products);

      return { contactList, productList };
    },
    [cacheKey],
    {
      tags: [cacheKey],
      revalidate: revalidationTime,
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
      revalidate: revalidationTime,
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
