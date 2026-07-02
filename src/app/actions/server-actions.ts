"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { QUERIES } from "@/server/db/queries";
import {
  BaseContact,
  Contact,
  InvoiceData,
  InvoiceItem,
  PrivateContact,
} from "@/constants/types";
import { ContactSchema, InvoiceSchema, ProductSchema } from "@/lib/schema";
import {
  productToInvoiceItem,
  rowToProduct,
  type ProductInput,
} from "@/lib/products";

const revalidationTime = 60 * 5; // 5 minute(s)

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
      const productList = products.map(rowToProduct).map(productToInvoiceItem);

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
      const productList = products.map(rowToProduct).map(productToInvoiceItem);

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

export const createDraftAction = async (
  draft: InvoiceData
): Promise<number | null> => {
  const result = InvoiceSchema.safeParse(draft);
  if (!result.success) {
    console.error(result.error);
    return null;
  }
  try {
    const row = await QUERIES.insertDraft(draft);
    revalidateTag("invoices-contacts");
    return row.id;
  } catch (err) {
    console.error("Server action error:", err);
    return null;
  }
};

export const updateDraftAction = async (id: number, draft: InvoiceData) => {
  const result = InvoiceSchema.safeParse(draft);
  if (!result.success) {
    console.error(result.error);
    return false;
  }
  try {
    await QUERIES.updateDraftById(id, draft);
    return true;
  } catch (err) {
    console.error("Server action error:", err);
    return false;
  }
};

// Promote a draft to an issued invoice; returns the assigned number or null.
export const submitDraftAction = async (id: number): Promise<string | null> => {
  try {
    const row = await QUERIES.submitDraft(id);
    revalidateTag("invoices-contacts");
    return row.invoiceId;
  } catch (err) {
    console.error("Server action error:", err);
    return null;
  }
};

export const discardDraftAction = async (id: number) => {
  try {
    await QUERIES.deleteDraftById(id);
    revalidateTag("invoices-contacts");
    return true;
  } catch (err) {
    console.error("Server action error:", err);
    return false;
  }
};

export const insertProductAction = async (product: ProductInput) => {
  const result = ProductSchema.safeParse(product);
  if (!result.success) {
    console.error(result.error);
    return false;
  }
  try {
    const saved = product.id
      ? await QUERIES.updateProduct(product.id, product)
      : await QUERIES.insertProduct(product);
    if (saved) {
      revalidateTag("invoices-contacts");
      revalidateTag("contacts-products");
      return true;
    }
  } catch (err) {
    console.error("Server action error:", err);
  }
  return false;
};

export const insertContactAction = async (newContact: BaseContact) => {
  const result = ContactSchema.safeParse(newContact);
  if (!result.success) {
    console.error(result.error);
    return false;
  }
  try {
    const insertedItem = await QUERIES.updateContact(newContact);
    if (insertedItem) {
      revalidatePath("/dashboard");
      return true;
    }
  } catch (err) {
    console.error("Server action error:", err);
  }
  return false;
};
