import React from "react";

import { InvoiceItem } from "@/constants/types";
import { toEuro } from "@/lib/utils";
import { computeInvoiceTotal } from "@/lib/invoice";

interface TotalProps {
  items: InvoiceItem[];
  taxRate: number;
}

function Total({ items, taxRate }: TotalProps) {
  const totalAmount = computeInvoiceTotal(items);

  const tax = taxRate / 100;
  const subtotal = totalAmount / (1 + tax);
  const taxAmount = totalAmount - subtotal;

  return (
    <>
      {/* Total */}
      <div className="flex justify-end space-x-2 border-y-2 border-current py-0.5 pr-10 font-bold">
        <span>Gesamtbetrag:</span>
        <span className="w-23 text-right">{toEuro(totalAmount)}</span>
      </div>
      {/* SubTotal */}
      <div className="flex justify-end pt-1 pr-10">
        <div>
          <div className="flex justify-end space-x-2 py-1.5 font-bold">
            <span>Rechnungsbetrag (Netto):</span>
            <span className="w-23 text-right">{toEuro(subtotal)}</span>
          </div>
          <div className="flex justify-end space-x-2 py-1.5 font-bold">
            <span>MwSt. von {taxRate},00 %:</span>
            <span className="w-23 text-right">{toEuro(taxAmount)}</span>
          </div>
          <div className="flex justify-end space-x-2 border-t py-1.5 font-bold">
            <span>Rechnungsbetrag (Brutto):</span>
            <span className="w-23 text-right">{toEuro(totalAmount)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Total;
