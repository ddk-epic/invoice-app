"use server";

import type { ZodTypeAny } from "zod";
import { QUERIES } from "@/server/db/queries";
import {
  BaseContact,
  Contact,
  CreateDraftInput,
  FinalizeResult,
  Invoice,
  LatestInvoice,
  Profile,
  WriteResult,
} from "@/constants/types";
import { BaseContactSchema, InvoiceSchema, ProductSchema } from "@/lib/schema";
import { rowToProduct, type Product, type ProductInput } from "@/lib/products";
import {
  createDraft,
  discardDraft,
  finalizeDraft,
  markPaid,
} from "@/server/invoice-transitions";

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
  privateContact: Profile;
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
  input: CreateDraftInput
): Promise<number | null> => createDraft(input);

export const updateDraftAction = async (
  id: number,
  draft: Invoice
): Promise<WriteResult> =>
  validateWrite("updateDraftAction", InvoiceSchema, draft, () =>
    QUERIES.updateDraftById(id, draft)
  );

export const finalizeDraftAction = async (
  id: number
): Promise<FinalizeResult> => finalizeDraft(id);

export const markPaidAction = async (id: number) => {
  const result = await markPaid(id);
  return result.ok;
};

export const discardDraftAction = async (id: number) => {
  const result = await discardDraft(id);
  return result.ok;
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
