import { invoiceTemplate } from "@/constants/constants";
import { InvoiceData } from "@/constants/types";

export function submitCreateInvoice(invoiceData: InvoiceData) {
  localStorage.setItem("InvoiceData", JSON.stringify(invoiceData));
}

export function getSavedInvoice(): InvoiceData {
  const savedData = localStorage.getItem("InvoiceData");
  return savedData ? JSON.parse(savedData) : invoiceTemplate;
}
