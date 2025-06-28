import React from "react";
import { InvoiceItem } from "@/constants/types";
import { toEuro } from "@/lib/utils";

interface TotalProps {
  items: InvoiceItem[];
  taxRate: number;
}

function Total({ items, taxRate }: TotalProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = taxRate / 100;
  const subtotal = total / (1 + tax);
  const taxAmount = total - subtotal;

  return (
    <>
      {/* Total */}
      <div className="flex justify-end py-0.5 pr-10 space-x-2 font-bold border-y-2 border-current">
        <span>Gesamtbetrag:</span>
        <span className="w-23 text-right">{toEuro(total)}</span>
      </div>
      {/* SubTotal */}
      <div className="flex justify-end pt-1 pr-10">
        <div>
          <div className="flex justify-end py-1.5 space-x-2 font-bold">
            <span>Rechnungsbetrag (Netto):</span>
            <span className="w-23 text-right">{toEuro(subtotal)}</span>
          </div>
          <div className="flex justify-end py-1.5 space-x-2 font-bold">
            <span>MwSt. von {taxRate},00 %:</span>
            <span className="w-23 text-right">{toEuro(taxAmount)}</span>
          </div>
          <div className="flex justify-end py-1.5 space-x-2 border-t font-bold">
            <span>Rechnungsbetrag (Brutto):</span>
            <span className="w-23 text-right">{toEuro(total)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Total;
