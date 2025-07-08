import z from "zod";

const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string().nullable().optional(),
  country: z.string(),
});

const ContactSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  owner: z.string().nullable().optional(),
  address: AddressSchema,
});

export const InvoiceSchema = z.object({
  invoiceId: z.string(),
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
