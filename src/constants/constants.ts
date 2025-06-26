import { InvoiceData, InvoiceItem } from "./types";

// Invoice status
export const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "overdue":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "draft":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export const invoiceStatistics = [
  {
    category: "Gesamte Rechnungen",
    value: "24",
    comment: "+2 seit letztem Monat",
  },
  {
    category: "Ausstehender Betrag",
    value: "12,450 €",
    comment: "3 ausstehende Rechnungen",
  },
  {
    category: "Diesen Monat",
    value: "8,750 €",
    comment: "+15 % gegenüber dem Vormonat",
  },
];

// Mock data for recent invoices
export const sampleRecentInvoices = [
  {
    id: "INV-001",
    client: "Acme Corp",
    amount: "$2,500.00",
    status: "paid",
    date: "2024-01-15",
  },
  {
    id: "INV-002",
    client: "TechStart Inc",
    amount: "$1,800.00",
    status: "pending",
    date: "2024-01-12",
  },
  {
    id: "INV-003",
    client: "Design Studio",
    amount: "$3,200.00",
    status: "overdue",
    date: "2024-01-08",
  },
  {
    id: "INV-004",
    client: "Marketing Pro",
    amount: "$950.00",
    status: "paid",
    date: "2024-01-05",
  },
  {
    id: "INV-005",
    client: "Web Solutions",
    amount: "$4,100.00",
    status: "draft",
    date: "2024-01-03",
  },
];

export const sampleContacts = [
  {
    id: "1",
    name: "Maxima",
    owner: "phtt",
    address: {
      street: "123 London street",
      city: "Hamburg",
      state: "HA",
      zip: "77777",
      country: "GER",
    },
  },
  {
    id: "2",
    name: "Tech Solutions Inc",
    address: {
      street: "456 Innovation Ave",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "USA",
    },
  },
  {
    id: "3",
    name: "Global Enterprises",
    address: {
      street: "456 Grocery Ave",
      city: "Greenville",
      state: "CA",
      zip: "90210",
      country: "USA",
    },
  },
  {
    id: "4",
    name: "Acme Corporation",
    address: {
      street: "123 Business St, Suite 100",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
  },
];

export const sampleProducts: InvoiceItem[] = [
  {
    id: "11",
    category: "fresh",
    description: "Bananas (kg)",
    brand: "Chiqueeta",
    weight: "1 kg",
    quantity: 3,
    rate: 129,
    amount: 387,
  },
  {
    id: "12",
    category: "fresh",
    description: "Organic Milk (1 L)",
    brand: "Hermes",
    weight: "1 kg",
    quantity: 1,
    rate: 425,
    amount: 425,
  },
  {
    id: "13",
    category: "fresh",
    description: "Eggs",
    brand: "Chiqueeta",
    perBox: 10,
    quantity: 2,
    rate: 35,
    amount: 70,
  },
  {
    id: "14",
    category: "fresh",
    description: "Whole Wheat Bread",
    brand: "Stones",
    weight: "0.75 kg",
    quantity: 1,
    rate: 275,
    amount: 275,
  },
];

export const sampleInvoiceData: InvoiceData = {
  id: 10,
  invoiceId: "INV-021",
  invoiceDate: "2025-06-20",
  dueDate: "2025-07-05",
  sender: {
    id: "1",
    name: "Maxima",
    owner: "phtt",
    address: {
      street: "123 London street",
      city: "Hamburg",
      state: "HA",
      zip: "77777",
      country: "GER",
    },
  },
  sendTo: {
    id: "3",
    name: "Global Enterprises",
    address: {
      street: "456 Grocery Ave",
      city: "Greenville",
      state: "CA",
      zip: "90210",
      country: "USA",
    },
  },
  invoiceTo: {
    id: "3",
    name: "Global Enterprises",
    address: {
      street: "456 Grocery Ave",
      city: "Greenville",
      state: "CA",
      zip: "90210",
      country: "USA",
    },
  },
  items: sampleProducts,

  total: 1787,
  taxRate: 19,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const invoiceJson = JSON.stringify({
  id: 1,
  invoiceId: "INV-021",
  invoiceDate: "2025-06-20",
  dueDate: "2025-07-05",
  sender: {
    id: "1",
    name: "Maxima",
    owner: "phtt",
    address: {
      street: "123 London street",
      city: "Hamburg",
      state: "HA",
      zip: "77777",
      country: "GER",
    },
  },
  sendTo: {
    id: "3",
    name: "Global Enterprises",
    address: {
      street: "456 Grocery Ave",
      city: "Greenville",
      state: "CA",
      zip: "90210",
      country: "USA",
    },
  },
  invoiceTo: {
    id: "3",
    name: "Global Enterprises",
    address: {
      street: "456 Grocery Ave",
      city: "Greenville",
      state: "CA",
      zip: "90210",
      country: "USA",
    },
  },
  items: [
    {
      id: "11",
      category: "fresh",
      description: "Bananas (kg)",
      brand: "Chiqueeta",
      weight: "1 kg",
      quantity: 3,
      rate: 129,
      amount: 387,
    },
    {
      id: "12",
      category: "fresh",
      description: "Organic Milk (1 L)",
      brand: "Hermes",
      weight: "1 kg",
      quantity: 1,
      rate: 425,
      amount: 425,
    },
    {
      id: "13",
      category: "fresh",
      description: "Eggs",
      brand: "Chiqueeta",
      perBox: 10,
      quantity: 2,
      rate: 35,
      amount: 70,
    },
    {
      id: "14",
      category: "fresh",
      description: "Whole Wheat Bread",
      brand: "Stones",
      weight: "0.75 kg",
      quantity: 1,
      rate: 275,
      amount: 275,
    },
  ],
  total: 1787,
  taxRate: 19,
  createdAt: "2025-06-23T18:33:25.603Z",
  updatedAt: "2025-06-23T18:33:25.416Z",
});
