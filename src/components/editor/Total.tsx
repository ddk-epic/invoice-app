import React from "react";

interface TotalProps {
  total: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
}

function Total(props: TotalProps) {
  const { total, subtotal, taxRate, taxAmount } = props;
  return (
    <div>
      <div className="flex justify-end py-1 space-x-2 font-bold overflow-auto">
        <span>Gesamtbetrag:</span>
        <span className="w-23 text-right">{total.toFixed(2)} €</span>
      </div>
      <div className="flex justify-end py-1 space-x-2 border-t font-bold">
        <span>Rechnungsbetrag (Netto):</span>
        <span className="w-23 text-right">{subtotal.toFixed(2)} €</span>
      </div>
      <div className="flex justify-end py-1 space-x-2 font-bold">
        <span>MwSt. von {taxRate},00 %:</span>
        <span className="w-23 text-right">{taxAmount.toFixed(2)} €</span>
      </div>
      <div className="flex justify-end py-1 space-x-2 border-t font-bold">
        <span>Rechnungsbetrag (Brutto):</span>
        <span className="w-23 text-right">{total.toFixed(2)} €</span>
      </div>
    </div>
  );
}

export default Total;
