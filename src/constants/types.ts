export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  email: string;
}
