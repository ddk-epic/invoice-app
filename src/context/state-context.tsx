"use client";

import { createContext, useCallback, useMemo, useState } from "react";

interface InvoiceFormContextProps {
  invoiceId: number;
  handleInvoiceId: (invoiceId: number) => void;

  contactId: number;
  handleContactId: (contactId: number) => void;
}

const InvoiceContext = createContext<InvoiceFormContextProps | null>(null);

const InvoiceContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //handle invoice state
  const [invoiceId, setInvoiceId] = useState<number>(0);
  const [contactId, setContactId] = useState<number>(0);

  const handleInvoiceId = useCallback((id: number) => setInvoiceId(id), []);
  const handleContactId = useCallback((id: number) => setContactId(id), []);

  const invoiceFormValue = useMemo(
    () => ({
      invoiceId,
      handleInvoiceId,
      contactId,
      handleContactId,
    }),
    [invoiceId, handleInvoiceId, contactId, handleContactId]
  );

  return (
    <InvoiceContext.Provider value={invoiceFormValue}>
      {children}
    </InvoiceContext.Provider>
  );
};

export { InvoiceContextProvider, InvoiceContext };
