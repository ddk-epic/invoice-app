"use server";

import type { ZodTypeAny } from "zod";
import { QUERIES } from "@/server/db/queries";
import {
  BaseContact,
  Contact,
  Invoice,
  LatestInvoice,
  PrivateContact,
  WriteResult,
} from "@/constants/types";
import { BaseContactSchema, InvoiceSchema, ProductSchema } from "@/lib/schema";
import { rowToProduct, type Product, type ProductInput } from "@/lib/products";

async function validateWrite(
  label: string,
  schema: ZodTypeAny,
  data: unknown,
  fn: () => Promise<unknown>
): Promise<WriteResult> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }
  try {
    const result = await fn();
    if (result === false) return { ok: false, error: "db" };
    return { ok: true };
  } catch (err) {
    console.error(`${label} failed:`, err);
    return { ok: false, error: "db" };
  }
}

export const getPrivateData = async () => {
  return QUERIES.getPrivateContact();
};

export const getInvoicesContactsProducts = async (): Promise<{
  invoiceList: LatestInvoice[];
  contactList: Contact[];
  productList: Product[];
}> => {
  const [invoices, contacts, products] = await Promise.all([
    QUERIES.getLatestInvoices(),
    QUERIES.getAllContacts(),
    QUERIES.getAllProducts(),
  ]);
  const invoiceList = invoices;
  const contactList = contacts;
  const productList = products.map(rowToProduct);

  return { invoiceList, contactList, productList };
};

// editor
export const getContactsAndProducts = async (): Promise<{
  privateContact: PrivateContact;
  contactList: Contact[];
  productList: Product[];
}> => {
  const [privateData, contacts, products] = await Promise.all([
    QUERIES.getPrivateContact(),
    QUERIES.getAllContacts(),
    QUERIES.getAllProducts(),
  ]);
  const [privateContact] = privateData;
  const contactList = contacts;
  const productList = products.map(rowToProduct);

  return { privateContact, contactList, productList };
};

export const getInvoiceData = async (invoiceId: string) => {
  return QUERIES.getInvoiceById(invoiceId);
};

export const createDraftAction = async (
  draft: Invoice
): Promise<number | null> => {
  const result = InvoiceSchema.safeParse(draft);
  if (!result.success) {
    console.error("createDraftAction: invalid draft:", result.error);
    return null;
  }
  try {
    const row = await QUERIES.insertDraft(draft);
    return row.id;
  } catch (err) {
    console.error("createDraftAction failed:", err);
    return null;
  }
};

export const updateDraftAction = async (
  id: number,
  draft: Invoice
): Promise<WriteResult> =>
  validateWrite("updateDraftAction", InvoiceSchema, draft, () =>
    QUERIES.updateDraftById(id, draft)
  );

// Promote a draft to an issued invoice; returns the assigned number or null.
export const submitDraftAction = async (id: number): Promise<string | null> => {
  try {
    const row = await QUERIES.submitDraft(id);
    return row.invoiceId;
  } catch (err) {
    console.error("submitDraftAction failed:", err);
    return null;
  }
};

export const markPaidAction = async (id: number) => {
  try {
    await QUERIES.markPaidById(id);
    return true;
  } catch (err) {
    console.error("markPaidAction failed:", err);
    return false;
  }
};

export const discardDraftAction = async (id: number) => {
  try {
    await QUERIES.deleteDraftById(id);
    return true;
  } catch (err) {
    console.error("discardDraftAction failed:", err);
    return false;
  }
};

export const insertProductAction = async (
  product: ProductInput
): Promise<WriteResult> =>
  validateWrite("insertProductAction", ProductSchema, product, () =>
    product.id
      ? QUERIES.updateProduct(product.id, product)
      : QUERIES.insertProduct(product)
  );

export const insertContactAction = async (
  newContact: BaseContact
): Promise<WriteResult> =>
  validateWrite("insertContactAction", BaseContactSchema, newContact, () =>
    QUERIES.insertContact(newContact)
  );

export const updateContactAction = async (
  id: number,
  contact: BaseContact
): Promise<WriteResult> =>
  validateWrite(
    "updateContactAction",
    BaseContactSchema,
    contact,
    async () => (await QUERIES.updateContact(id, contact)).rowCount > 0
  );
