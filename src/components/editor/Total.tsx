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
    <>
      {/* Total */}
      <div className="flex justify-end py-1.5 pr-10 space-x-2 font-bold border-y-2 border-current">
        <span>Gesamtbetrag:</span>
        <span className="w-23 text-right">{total.toFixed(2)} €</span>
      </div>
      {/* SubTotal */}
      <div className="flex justify-end pr-10">
        <div>
          <div className="flex justify-end py-1.5 space-x-2 font-bold">
            <span>Rechnungsbetrag (Netto):</span>
            <span className="w-23 text-right">{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-end py-1.5 space-x-2 font-bold">
            <span>MwSt. von {taxRate},00 %:</span>
            <span className="w-23 text-right">{taxAmount.toFixed(2)} €</span>
          </div>
          <div className="flex justify-end py-1.5 space-x-2 border-t font-bold">
            <span>Rechnungsbetrag (Brutto):</span>
            <span className="w-23 text-right">{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Total;
