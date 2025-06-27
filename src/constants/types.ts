export interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: string;
  date: string;
}

export interface Contact {
  id: string;
  name: string;
  owner?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface InvoiceItem {
  id: string;
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

export interface InvoiceData {
  id: number;
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;

  sender: Contact;
  sendTo: Contact;
  invoiceTo: Contact;

  items: InvoiceItem[];
  total: number;
  taxRate: number;

  createdAt: Date;
  updatedAt: Date;
}
