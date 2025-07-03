import { invoiceTemplate } from "@/constants/constants";
import { InvoiceData } from "@/constants/types";

export function saveInvoiceChanges(key: string, invoiceData: InvoiceData) {
  localStorage.setItem(key, JSON.stringify(invoiceData));
}

export function getInvoiceChanges(key: string): InvoiceData {
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : invoiceTemplate;
}

export function deleteInvoiceChanges(key: string) {
  localStorage.removeItem(key);
}
