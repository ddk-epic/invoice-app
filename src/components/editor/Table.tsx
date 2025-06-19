import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { InvoiceItem } from "@/constants/types";

interface TableProps {
  items: InvoiceItem[];
  updateItem: (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => void;
  removeItem: (id: string) => void;
}

function Table(props: TableProps) {
  const { items, updateItem, removeItem } = props;
  return (
    <table className="w-full border-y-2 border-current">
      <thead className="border-y-2 border-current">
        <tr>
          <th className="text-left py-0.5 px-2 font-medium">Umschreibung</th>
          <th className="w-17 py-0.5 px-2 text-right font-medium">Menge</th>
          <th className="w-17 py-0.5 px-2 text-right font-medium">Preis</th>
          <th className="w-23 py-0.5 text-right font-medium">Nettowert</th>
          <th className="w-12"></th>
        </tr>
      </thead>
      {items.length > 0 && (
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="max-w-[300px] pl-2 truncate">Item description</td>
              <td className="w-13 px-2">
                <Input
                  id="quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "quantity",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-13 h-auto border-1 p-0 text-right focus-visible:ring-0"
                  min="0"
                  step="1"
                />
              </td>
              <td className="w-13 px-2">
                <Input
                  id="rate"
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "rate",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-13 h-auto border-1 p-0 text-right focus-visible:ring-0"
                  min="0"
                  step="1"
                />
              </td>
              <td className="w-23 text-right font-medium">
                {item.amount.toFixed(2)} €
              </td>
              <td className="px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
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
