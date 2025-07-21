"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { QUERIES } from "@/server/db/queries";
import {
  BaseContact,
  BaseInvoiceItem,
  Contact,
  InvoiceData,
  InvoiceItem,
  ParseProduct,
  PrivateContact,
} from "@/constants/types";
import { ContactSchema, InvoiceSchema, ProductSchema } from "@/lib/schema";

const revalidationTime = 60 * 5; // 5 minute(s)

const parseProductJson = (productList: ParseProduct): InvoiceItem[] => {
  return productList[0].categoryJson as InvoiceItem[];
};

export const getPrivateData = async () => {
  const cacheKey = "private";
  const cached = unstable_cache(
    async () => QUERIES.getPrivateContact(),
    [cacheKey],
    {
      tags: [cacheKey],
      revalidate: revalidationTime,
    }
  );
  return cached();
};

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
  privateContact: PrivateContact;
  contactList: Contact[];
  productList: InvoiceItem[];
}> => {
  const cacheKey = "contacts-products";

  const cached = unstable_cache(
    async () => {
      const [privateData, contacts, products] = await Promise.all([
        QUERIES.getPrivateContact(),
        QUERIES.getAllContacts(),
        QUERIES.getAllProducts(),
      ]);
      const [privateContact] = privateData as PrivateContact[];
      const contactList = contacts as Contact[];
      const productList = parseProductJson(products);

      return { privateContact, contactList, productList };
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
  const result = InvoiceSchema.safeParse(invoiceData);
  if (!result.success) {
    console.log(result.error);
    return false;
  }
  try {
    const insertedInvoice = await QUERIES.insertInvoice(invoiceData);
    if (insertedInvoice) {
      console.log("successfully saved to the database!");
      revalidatePath("/dashboard");
      return true;
    }
  } catch (err) {
    console.error("Server action error:", err);
  }
  return false;
};

export const insertProductAction = async (
  productList: InvoiceItem[],
  newItem: InvoiceItem
) => {
  const result = ProductSchema.safeParse(newItem);
  if (!result.success) {
    console.log(result.error);
    return false;
  }
  try {
    const insertedItem = await QUERIES.updateProduct(productList, newItem);
    if (insertedItem) {
      console.log("successfully saved to the database!");
      revalidatePath("/dashboard");
      return true;
    }
  } catch (err) {
    console.error("Server action error:", err);
  }
  return false;
};

export const insertContactAction = async (
  newContact: BaseContact
) => {
  const result = ContactSchema.safeParse(newContact);
  if (!result.success) {
    console.log(result.error);
    return false;
  }
  try {
    const insertedItem = await QUERIES.updateContact(newContact);
    if (insertedItem) {
      console.log("successfully saved to the database!");
      revalidatePath("/dashboard");
      return true;
    }
  } catch (err) {
    console.error("Server action error:", err);
  }
  return false;
};
