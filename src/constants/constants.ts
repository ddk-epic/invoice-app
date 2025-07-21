import {
  BaseContact,
  BaseInvoiceItem,
  Contact,
  InvoiceData,
  InvoiceItem,
} from "./types";

// Invoice status
export const getStatusColor = (status: string) => {
  switch (status) {
    case "Bezahlt":
      return "bg-green-100 text-green-800";
    case "Offen":
      return "bg-yellow-100 text-yellow-800";
    case "Überfällig":
      return "bg-red-100 text-red-800";
    case "Entwurf":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
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

export const baseItem: InvoiceItem = {
  id: 0,
  category: "",
  description: "",
  brand: "",
  origin: "",
  weight: "",
  perBox: 0,
  quantity: 1,
  rate: 0,
  amount: 0,
};

export const moreSampleProducts: InvoiceItem[] = [
  {
    id: 21,
    category: "fresh",
    description: "Apples (kg)",
    brand: "FarmGold",
    weight: "1 kg",
    quantity: 1,
    rate: 150,
    amount: 300,
  },
  {
    id: 22,
    category: "dairy",
    description: "Greek Yogurt",
    brand: "Milko",
    weight: "500 g",
    quantity: 1,
    rate: 120,
    amount: 360,
  },
  {
    id: 23,
    category: "bakery",
    description: "Croissants (Box of 4)",
    brand: "BakeHouse",
    weight: "400 g",
    quantity: 1,
    rate: 250,
    amount: 250,
  },
  {
    id: 24,
    category: "beverages",
    description: "Orange Juice",
    brand: "SunFresh",
    weight: "1 L",
    quantity: 1,
    rate: 180,
    amount: 360,
  },
  {
    id: 25,
    category: "snacks",
    description: "Potato Chips",
    brand: "CrunchyBite",
    weight: "150 g",
    quantity: 1,
    rate: 80,
    amount: 320,
  },
  {
    id: 26,
    category: "frozen",
    description: "Chicken Nuggets",
    brand: "MeatyBites",
    weight: "500 g",
    quantity: 1,
    rate: 350,
    amount: 700,
  },
  {
    id: 27,
    category: "fresh",
    description: "Spinach",
    brand: "GreenLeaf",
    weight: "250 g",
    quantity: 1,
    rate: 60,
    amount: 120,
  },
  {
    id: 28,
    category: "grains",
    description: "Basmati Rice",
    brand: "RoyalGrain",
    weight: "5 kg",
    quantity: 1,
    rate: 820,
    amount: 820,
  },
  {
    id: 29,
    category: "spices",
    description: "Turmeric Powder",
    brand: "SpiceKing",
    weight: "200 g",
    quantity: 1,
    rate: 95,
    amount: 95,
  },
  {
    id: 30,
    category: "personal care",
    description: "Toothpaste",
    brand: "BrightSmile",
    weight: "150 g",
    quantity: 1,
    rate: 90,
    amount: 180,
  },
  {
    id: 31,
    category: "cleaning",
    description: "Dishwashing Liquid",
    brand: "Sparkle",
    weight: "750 ml",
    quantity: 1,
    rate: 150,
    amount: 150,
  },
  {
    id: 32,
    category: "baby",
    description: "Baby Wipes (Pack of 80)",
    brand: "SoftCare",
    quantity: 1,
    rate: 220,
    amount: 220,
  },
  {
    id: 33,
    category: "pets",
    description: "Dog Food - Chicken Flavor",
    brand: "PawPride",
    weight: "2 kg",
    quantity: 1,
    rate: 600,
    amount: 600,
  },
  {
    id: 34,
    category: "household",
    description: "Garbage Bags (Large, Pack of 15)",
    brand: "CleanZone",
    quantity: 1,
    rate: 130,
    amount: 260,
  },
];

export const invoiceTemplate: InvoiceData = {
  invoiceId: "0",
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date().toISOString().split("T")[0],
  status: "Entwurf",
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
  status: "Entwurf",
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
