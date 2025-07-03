"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceData } from "@/constants/types";

interface InvoiceDetailsProps {
  invoiceData: InvoiceData;
  updateDetails: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function InvoiceDetails({ invoiceData, updateDetails }: InvoiceDetailsProps) {
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="font-medium min-w-[160px]">Rechnungsnummer:</Label>
        <Input
          id="invoice-number"
          value={invoiceData.invoiceId}
          onChange={(e) => updateDetails(e)}
          className="w-30 md:w-36 h-8"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="font-medium min-w-[160px]">Rechnungsdatum:</Label>
        <Input
          id="invoice-date"
          type="date"
          value={invoiceDate}
          onChange={(e) => updateDetails(e)}
          className="w-30 md:w-36 h-8"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="font-medium min-w-[160px]">Fälligkeitsdatum:</Label>
        <Input
          id="due-date"
          type="date"
          value={invoiceData.dueDate}
          onChange={(e) => updateDetails(e)}
          className="w-30 md:w-36 h-8"
        />
      </div>
    </div>
  );
}

export default InvoiceDetails;
