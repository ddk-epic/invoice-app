import z from "zod";

import type { Address, DraftItem } from "@/constants/types";
import type { BaseContact, Contact } from "@/lib/contacts";
import { ContentUnitSchema, type ProductInput } from "@/lib/products";

const AddressSchema: z.ZodType<Address> = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.number(),
  country: z.string(),
});

export const BaseContactSchema: z.ZodType<BaseContact> = z.object({
  type: z.string(),
  name: z.string(),
  owner: z.string().optional(),
  address: AddressSchema,
});

const ContactSchema: z.ZodType<Contact> = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  owner: z.string().optional(),
  address: AddressSchema,
});

const DraftItemSchema: z.ZodType<DraftItem> = z.object({
  productId: z.number(),
  quantity: z.number(),
});

// Autosave payload: a Draft's editable subset. sender, invoiceId and frozen
// items/total are server-owned at finalize, never client-authored.
export const DraftSchema = z.object({
  invoiceId: z.string(),
  invoiceDate: z.string(),
  dueDate: z.string(),
  status: z.literal("draft"),
  locationId: z.number().nullable().optional(),
  sender: z.null(),
  sendTo: ContactSchema,
  invoiceTo: ContactSchema,
  items: z.array(DraftItemSchema),
  total: z.number(),
  taxRate: z.number(),
});

export const ProductSchema: z.ZodType<ProductInput> = z.object({
  id: z.number().optional(),
  barcode: z.string().nullable().optional(),
  category: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  netContent: z.number().positive(),
  contentUnit: ContentUnitSchema,
  packSize: z.number().int().positive().nullable().optional(),
  price: z.number().nonnegative(),
});
