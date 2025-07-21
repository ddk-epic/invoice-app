import z from "zod";

const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.number().optional(),
  country: z.string(),
});

export const ContactSchema = z.object({
  id: z.number().optional(),
  type: z.string(),
  name: z.string(),
  owner: z.string().nullable().optional(),
  address: AddressSchema,
});

export const InvoiceSchema = z.object({
  invoiceId: z.string().optional(),
  invoiceDate: z.string(),
  dueDate: z.string(),
  status: z.string(),
  sender: ContactSchema,
  sendTo: ContactSchema,
  invoiceTo: ContactSchema,
  items: z.array(z.unknown()),
  total: z.number(),
  taxRate: z.number(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const ProductSchema = z.object({
  amount: z.number(),
  category: z.string(),
  description: z.string(),
  brand: z.string(),
  origin: z.string().optional(),
  weight: z.string().optional(),
  perBox: z.number().optional(),
  quantity: z.number(),
  rate: z.number(),
});
