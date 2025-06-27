"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoiceDetailsProps {
  invoiceId: number;
  setInvoiceId: (invoiceId: number) => void;
}

function InvoiceDetails({ invoiceId, setInvoiceId }: InvoiceDetailsProps) {
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="font-medium min-w-[160px]">Rechnungsnummer:</Label>
        <Input
          id="invoice-number"
          value={invoiceId}
          onChange={(e) => setInvoiceId(Number(e.target.value))}
          className="w-30 md:w-36 h-8"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="font-medium min-w-[160px]">Rechnungsdatum:</Label>
        <Input
          id="invoice-date"
          type="date"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
          className="w-30 md:w-36 h-8"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="font-medium min-w-[160px]">Fälligkeitsdatum:</Label>
        <Input
          id="due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-30 md:w-36 h-8"
        />
      </div>
    </div>
  );
}

export default InvoiceDetails;
