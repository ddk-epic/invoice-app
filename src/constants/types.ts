import type { Product } from "@/lib/products";

export type InvoiceStatus = "draft" | "open" | "paid" | "overdue";

export type WriteResult =
  { ok: true } | { ok: false; error: "validation" | "db" };

export interface CreateDraftInput {
  contactId: number;
  locationId?: number;
}

export type FinalizeResult =
  | { ok: true; number: string }
  | {
      ok: false;
      reason:
        "not_found" | "not_finalizable" | "no_profile" | "no_location" | "db";
    };

export interface Profile {
  id?: number;
  name: string;
  phone: string;
  email: string;
}

export interface Location {
  id: number;
  label: string | null;
  address: Address;
  isPrimary: boolean;
}

// Thin invoice row for the /invoice list.
export interface InvoiceRow {
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

export interface DraftItem {
  productId: number;
  quantity: number;
}

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

export interface Invoice {
  id?: number;
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  locationId?: number | null;

  sender: Contact | null;
  sendTo: Contact;
  invoiceTo: Contact;

  items: InvoiceItem[];
  total: number;
  taxRate: number;

  createdAt: Date;
  updatedAt: Date;
}
