import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { InvoiceItem } from "@/constants/types";
import { centsToEuro } from "@/lib/utils";

interface TableProps {
  items: InvoiceItem[];
  updateItemQty: (id: string, value: number) => void;
  removeItem: (id: string) => void;
}

function Table(props: TableProps) {
  const { items, updateItemQty, removeItem } = props;
  return (
    <table className="w-full">
      <thead className="border-y-2 border-current">
        <tr>
          <th className="w-13 py-0.5 px-2 text-start font-medium">Nr.</th>
          <th className="max-w-[300px] py-0.5 text-left font-medium">
            Umschreibung
          </th>
          <th className="w-13 py-0.5 pr-2 text-right font-medium">Menge</th>
          <th className="w-23 py-0.5 pr-2 text-right font-medium">Preis</th>
          <th className="w-23 py-0.5 text-right font-medium">Nettowert</th>
          <th className="w-10"></th>
        </tr>
      </thead>
      {items.length > 0 && (
        <tbody>
          {items.map((item, index) => (
            // @ts-ignore
            <tr key={item.id} className="border-t">
              <td className="w-13 px-2">{index + 1}</td>
              <td className="max-w-[300px] truncate">
                {item.description} {item.brand.toUpperCase()}
                {item.weight && ", "}
                {item.perBox ? item.perBox + " X " + item.weight : item.weight}
              </td>
              <td className="w-13 pr-2">
                <Input
                  id={item.id.toString()}
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItemQty(
                      item.id.toString(),
                      Number(e.target.value) || 0
                    )
                  }
                  className="w-13 h-auto border-1 p-0 text-right focus-visible:ring-0"
                  min="0"
                  step="1"
                />
              </td>
              <td className="w-23 pr-2 text-right">{centsToEuro(item.rate)}</td>
              <td className="w-23 text-right font-medium">
                {centsToEuro(item.amount)}
              </td>
              <td className="px-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id.toString())}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
}

export default Table;
