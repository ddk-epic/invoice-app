import { invoiceTemplate } from "@/constants/constants";
import { InvoiceData } from "@/constants/types";

export function saveInvoiceChanges(invoiceData: InvoiceData) {
  localStorage.setItem("InvoiceData", JSON.stringify(invoiceData));
}

export function getInvoiceChanges(): InvoiceData {
  const savedData = localStorage.getItem("InvoiceData");
  return savedData ? JSON.parse(savedData) : invoiceTemplate;
}
