"use client";

import { useContext } from "react";
import { InvoiceContext } from "@/context/state-context";

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error(
      "useInvoiceContext must be used within an InvoiceContextProvider"
    );
  }
  return context;
};
