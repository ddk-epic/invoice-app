"use server";

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

export const getPrivateData = async () => {
  return QUERIES.getPrivateContact();
};

export const getInvoicesContactsProducts = async (): Promise<{
  invoiceList: InvoiceData[];
  contactList: Contact[];
  productList: InvoiceItem[];
}> => {
  const [invoices, contacts, products] = await Promise.all([
    QUERIES.getAllInvoices(),
    QUERIES.getAllContacts(),
    QUERIES.getAllProducts(),
  ]);
  const invoiceList = invoices as InvoiceData[];
  const contactList = contacts as Contact[];
  const productList = products.map(rowToProduct).map(productToInvoiceItem);

  return { invoiceList, contactList, productList };
};

// editor
export const getContactsAndProducts = async (): Promise<{
  privateContact: PrivateContact;
  contactList: Contact[];
  productList: InvoiceItem[];
}> => {
  const [privateData, contacts, products] = await Promise.all([
    QUERIES.getPrivateContact(),
    QUERIES.getAllContacts(),
    QUERIES.getAllProducts(),
  ]);
  const [privateContact] = privateData as PrivateContact[];
  const contactList = contacts as Contact[];
  const productList = products.map(rowToProduct).map(productToInvoiceItem);

  return { privateContact, contactList, productList };
};

export const getInvoiceData = async (invoiceId: string) => {
  return QUERIES.getInvoiceById(invoiceId);
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
    return row.invoiceId;
  } catch (err) {
    console.error("Server action error:", err);
    return null;
  }
};

export const markPaidAction = async (id: number) => {
  try {
    await QUERIES.markPaidById(id);
    return true;
  } catch (err) {
    console.error("Server action error:", err);
    return false;
  }
};

export const discardDraftAction = async (id: number) => {
  try {
    await QUERIES.deleteDraftById(id);
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
    const insertedItem = await QUERIES.insertContact(newContact);
    if (insertedItem) {
      return true;
    }
  } catch (err) {
    console.error("Server action error:", err);
  }
  return false;
};

export const updateContactAction = async (id: number, contact: BaseContact) => {
  const result = ContactSchema.safeParse(contact);
  if (!result.success) {
    console.error(result.error);
    return false;
  }
  try {
    const updated = await QUERIES.updateContact(id, contact);
    if (updated.rowCount > 0) {
      return true;
    }
  } catch (err) {
    console.error("Server action error:", err);
  }
  return false;
};
