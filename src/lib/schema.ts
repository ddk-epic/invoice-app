import z from "zod";

import type {
  Address,
  BaseContact,
  Contact,
  InvoiceItem,
} from "@/constants/types";
import type { ProductInput } from "@/lib/products";

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

const InvoiceItemSchema: z.ZodType<InvoiceItem> = z.object({
  id: z.number(),
  category: z.string(),
  description: z.string(),
  brand: z.string(),
  origin: z.string().optional(),
  weight: z.string().optional(),
  perBox: z.number().optional(),
  quantity: z.number(),
  rate: z.number(),
  amount: z.number(),
});

// Write payload; not pinned to InvoiceData (invoiceId is set on submit, dates may be strings).
export const InvoiceSchema = z.object({
  invoiceId: z.string().optional(),
  invoiceDate: z.string(),
  dueDate: z.string(),
  status: z.enum(["draft", "open", "paid", "overdue"]),
  sender: ContactSchema,
  sendTo: ContactSchema,
  invoiceTo: ContactSchema,
  items: z.array(InvoiceItemSchema),
  total: z.number(),
  taxRate: z.number(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const ProductSchema: z.ZodType<ProductInput> = z.object({
  id: z.number().optional(),
  gtin: z.string().nullable().optional(),
  category: z.string().min(1),
  description: z.string().min(1),
  brand: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  netContent: z.number().positive(),
  contentUnit: z.enum(["g", "kg", "ml", "l", "Stk"]),
  packSize: z.number().int().positive().nullable().optional(),
  price: z.number().nonnegative(),
});
