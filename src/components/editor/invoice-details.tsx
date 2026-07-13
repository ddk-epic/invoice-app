"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/constants/types";
import { addDays } from "@/lib/utils";

const PAYMENT_TERMS = [14, 30] as const;

interface InvoiceDetailsProps {
  invoiceData: Invoice;
  updateDetails: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDueFromTerm: (days: number) => void;
}

function InvoiceDetails({
  invoiceData,
  updateDetails,
  setDueFromTerm,
}: InvoiceDetailsProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="min-w-[160px] font-medium">Rechnungsnummer:</Label>
        <Input
          id="invoice-number"
          name="invoiceId"
          value={invoiceData.invoiceId}
          readOnly
          placeholder="(wird vergeben)"
          className="h-8 w-30 md:w-36"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="min-w-[160px] font-medium">Rechnungsdatum:</Label>
        <Input
          id="invoice-date"
          name="invoiceDate"
          type="date"
          value={invoiceData.invoiceDate}
          onChange={(e) => updateDetails(e)}
          className="h-8 w-30 md:w-36"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="min-w-[160px] font-medium">Fälligkeitsdatum:</Label>
        <Input
          id="due-date"
          name="dueDate"
          type="date"
          value={invoiceData.dueDate}
          onChange={(e) => updateDetails(e)}
          className="h-8 w-30 md:w-36"
        />
        <div className="inline-flex overflow-hidden rounded-md border">
          {PAYMENT_TERMS.map((days) => {
            const active =
              invoiceData.dueDate === addDays(invoiceData.invoiceDate, days);
            return (
              <Button
                key={days}
                type="button"
                variant={active ? "default" : "ghost"}
                size="sm"
                title={`+${days} Tage`}
                onClick={() => setDueFromTerm(days)}
                className="h-8 rounded-none border-0 border-l px-2 first:border-l-0"
              >
                +{days}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetails;
