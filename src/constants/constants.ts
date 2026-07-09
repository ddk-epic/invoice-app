import { BaseContact, Contact, InvoiceData, InvoiceStatus } from "./types";
import type { ProductInput } from "@/lib/products";

// UI-boundary German labels for the internal status.
export const statusLabel: Record<InvoiceStatus, string> = {
  draft: "Entwurf",
  open: "Offen",
  paid: "Bezahlt",
  overdue: "Überfällig",
};

const statusColor: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-800",
  open: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
};

export const getStatusColor = (status: InvoiceStatus) =>
  statusColor[status] ?? "bg-gray-100 text-gray-800";

export const sectionLabel: Record<"draft" | "overdue" | "open", string> = {
  draft: "Entwürfe",
  overdue: "Überfällig",
  open: "Offen",
};

export const baseContact: BaseContact = {
  type: "client",
  name: "",
  owner: "",
  address: {
    street: "",
    city: "",
    state: "-",
    zip: 0,
    country: "Deutschland",
  },
};

export const empty: Contact = {
  id: 0,
  type: "client",
  name: "undefined",
  address: {
    street: "",
    city: "",
    state: "",
    zip: 0,
    country: "",
  },
};

export const sampleContacts: Contact[] = [
  {
    id: 1,
    type: "admin",
    name: "Maxima",
    owner: "phtt",
    address: {
      street: "123 London street",
      city: "Hamburg",
      state: "HA",
      zip: 77777,
      country: "GER",
    },
  },
  {
    id: 2,
    type: "client",
    name: "Tech Solutions Inc",
    address: {
      street: "456 Innovation Ave",
      city: "San Francisco",
      state: "CA",
      zip: 94105,
      country: "USA",
    },
  },
  {
    id: 3,
    type: "client",
    name: "Global Enterprises",
    address: {
      street: "456 Grocery Ave",
      city: "Greenville",
      state: "CA",
      zip: 90210,
      country: "USA",
    },
  },
  {
    id: 4,
    type: "client",
    name: "Acme Corporation",
    address: {
      street: "123 Business St, Suite 100",
      city: "New York",
      state: "NY",
      zip: 10001,
      country: "USA",
    },
  },
];

export const baseProduct: ProductInput = {
  barcode: "",
  category: "",
  name: "",
  brand: "",
  origin: "",
  netContent: 0,
  contentUnit: "g",
  packSize: null,
  price: 0,
};

export const invoiceTemplate: InvoiceData = {
  invoiceId: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date().toISOString().split("T")[0],
  status: "draft",
  sender: {
    id: 1,
    type: "admin",
    name: "Maxima",
    owner: "phtt",
    address: {
      street: "123 London street",
      city: "Hamburg",
      state: "HA",
      zip: 77777,
      country: "GER",
    },
  },
  sendTo: empty,
  invoiceTo: empty,
  items: [],

  total: 0,
  taxRate: 7,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const sampleInvoiceData: InvoiceData = {
  id: 10,
  invoiceId: "21",
  invoiceDate: "2025-06-20",
  dueDate: "2025-07-05",
  status: "draft",
  sender: {
    id: 0,
    type: "admin",
    name: "admin",
    owner: "admin",
    address: {
      street: "",
      city: "",
      state: "",
      zip: 0,
      country: "",
    },
  },
  sendTo: {
    id: 3,
    type: "client",
    name: "client",
    owner: "client",
    address: {
      street: "",
      city: "",
      state: "",
      zip: 0,
      country: "",
    },
  },
  invoiceTo: {
    id: 3,
    type: "client",
    name: "client",
    owner: "client",
    address: {
      street: "",
      city: "",
      state: "",
      zip: 0,
      country: "",
    },
  },
  items: [],

  total: 0,
  taxRate: 7,
  createdAt: new Date(),
  updatedAt: new Date(),
};
