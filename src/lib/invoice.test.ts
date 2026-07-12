import { describe, it, expect } from "vitest";
import type { Invoice, InvoiceItem } from "@/constants/types";
import { canFinalize, computeInvoiceTotal } from "./invoice";

const item = (over: Partial<InvoiceItem> = {}): InvoiceItem => ({
  id: 1,
  barcode: null,
  category: "beverage",
  name: "Bier",
  brand: null,
  origin: null,
  netContent: 330,
  contentUnit: "ml",
  packSize: null,
  price: 2,
  quantity: 1,
  amount: 2,
  ...over,
});

const draft = (items: InvoiceItem[]): Invoice => ({
  invoiceId: "",
  invoiceDate: "2026-07-12",
  dueDate: "2026-07-26",
  status: "draft",
  sender: null,
  sendTo: {} as Invoice["sendTo"],
  invoiceTo: {} as Invoice["invoiceTo"],
  items,
  total: 0,
  taxRate: 7,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("canFinalize", () => {
  it("is false with no line items", () => {
    expect(canFinalize(draft([]))).toBe(false);
  });
  it("is true with at least one line item", () => {
    expect(canFinalize(draft([item()]))).toBe(true);
  });
});

describe("computeInvoiceTotal", () => {
  it("sums line amounts", () => {
    expect(
      computeInvoiceTotal([item({ amount: 4 }), item({ amount: 6.5 })])
    ).toBe(10.5);
  });
});
