"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { sampleContacts, sampleSender } from "@/constants/constants";
import { Contact, InvoiceItem } from "@/constants/types";
import { SelectContact } from "./SelectGroup";

export default function InvoiceEditor() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");

  const [sender, setSender] = useState<Contact | null>(null);
  const [recipient, setRecipient] = useState<Contact | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const taxRate = 19;

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateSender = (id: string) => {
    const newSender = sampleSender.find((contact) => contact.id === id);
    setSender(newSender || null);
  };

  const updateRecipient = (id: string) => {
    const newRecipient = sampleContacts.find((contact) => contact.id === id);
    setRecipient(newRecipient || null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <Card
      className="wrapper min-h-[1086px] md:min-h-[1584px] bg-white shadow-lg"
      //style={{ aspectRatio: "210/297", minHeight: "842px" }}
    >
      <div className="py-6 px-12 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium min-w-[100px]">
                  Invoice #:
                </Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-30 md:w-36 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium min-w-[100px]">
                  Date:
                </Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-30 md:w-36 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium min-w-[100px]">
                  Due Date:
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-30 md:w-36 h-8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sender and Recipient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <SelectContact
            label="Sender"
            contact={sender}
            selectContact={updateSender}
            contactList={sampleSender}
          />
          <SelectContact
            label="Recipient"
            contact={recipient}
            selectContact={updateRecipient}
            contactList={sampleContacts}
          />
        </div>

        {/* Invoice Items */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <Button
              onClick={addItem}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-hidden mb-1">
            <table className="w-full border-y-2 border-current">
              <thead className="border-y-2 border-current">
                <tr>
                  <th className="text-left py-0.5 px-3 font-medium">
                    Description
                  </th>
                  <th className="text-right py-0.5 px-3 font-medium w-20">
                    Qty
                  </th>
                  <th className="text-right py-0.5 px-3 font-medium w-24">
                    Rate
                  </th>
                  <th className="text-right py-0.5 px-3 font-medium w-24">
                    Amount
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              {items.length > 0 && (
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-0.5 px-3">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          placeholder="Item description"
                          className="border-0 p-0 h-auto focus-visible:ring-0"
                        />
                      </td>
                      <td className="py-0.5 px-3">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                          className="text-right border-0 p-0 h-auto focus-visible:ring-0"
                          min="0"
                          step="1"
                        />
                      </td>
                      <td className="py-0.5 px-3">
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "rate",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                          className="text-right border-0 p-0 h-auto focus-visible:ring-0"
                          min="0"
                          step="1"
                        />
                      </td>
                      <td className="py-0.5 px-3 text-right font-medium">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="py-0.5 px-3">
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
          </div>

          {items.length === 0 && (
            <div className="text-center py-2 text-gray-500 border-2 border-dashed rounded-lg">
              <p>No items added yet</p>
            </div>
          )}

          {/* Totals */}

          <div className="flex justify-end mr-17">
            <div className="w-55 border border-transparent">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <span>Tax:</span>
                  <span>{taxRate} %</span>
                </div>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-t font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
