import type { Product } from "@/lib/products";

export type InvoiceStatus = "draft" | "open" | "paid" | "overdue";

export type WriteResult =
  { ok: true } | { ok: false; error: "validation" | "db" };

export interface PrivateContact {
  id?: number;
  phone: string;
  email: string;
}

// Thin invoice row for the /invoice list.
export interface Invoice {
  id: number;
  invoiceId: string;
  status: InvoiceStatus;
  total: number;
  createdAt: Date;
  client: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: number;
  country: string;
}

export interface BaseContact {
  type: string;
  name: string;
  owner?: string;
  address: Address;
}

export interface Contact extends BaseContact {
  id: number;
}

// An invoice line is a catalog product placed on an invoice, plus quantity/amount.
export interface InvoiceItem extends Product {
  quantity: number;
  amount: number;
}

// Thin invoice slice for the dashboard: what getLatestInvoices returns.
// `status` is only ever a stored value here (overdue is derived downstream).
export interface LatestInvoice {
  id: number;
  invoiceId: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  updatedAt: Date;
  total: number;
  client: string;
}

export interface InvoiceData {
  id?: number;
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;

  sender: Contact;
  sendTo: Contact;
  invoiceTo: Contact;

  items: InvoiceItem[];
  total: number;
  taxRate: number;

  createdAt: Date;
  updatedAt: Date;
}
