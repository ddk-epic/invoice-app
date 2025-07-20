export interface PrivateContact {
  id?: number;
  phone: string;
  email: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: string;
  date: string;
}

export interface BaseContact {
  type: string;
  name: string;
  owner?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: number;
    country: string;
  };
}

export interface Contact extends BaseContact {
  id: number;
}

export interface BaseInvoiceItem {
  category: string;
  description: string;
  brand: string;
  origin?: string;
  weight?: string;
  perBox?: number;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceItem extends BaseInvoiceItem {
  id: number;
}

export interface InvoiceData {
  id?: number;
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;
  status: string;

  sender: Contact;
  sendTo: Contact;
  invoiceTo: Contact;

  items: InvoiceItem[];
  total: number;
  taxRate: number;

  createdAt: Date;
  updatedAt: Date;
}

export type ParseProduct = {
  id?: number;
  categoryName: string;
  categoryJson: unknown;
}[];