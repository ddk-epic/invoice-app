"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { sampleContacts } from "@/constants/constants";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Contact {
  id: string;
  name: string;
  address: string;
  email: string;
}

export default function InvoiceEditor() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [sender, setSender] = useState<Contact | null>(null);
  const [recipient, setRecipient] = useState<Contact | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [taxRate, setTaxRate] = useState(10);

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

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const getContactById = (id: string) =>
    sampleContacts.find((contact) => contact.id === id);

  return (
    <Card
      className="bg-white shadow-lg"
      style={{ aspectRatio: "210/297", minHeight: "842px" }}
    >
      <div className="p-12 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="invoice-number"
                  className="text-sm font-medium min-w-[100px]"
                >
                  Invoice #:
                </Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-32 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="invoice-date"
                  className="text-sm font-medium min-w-[100px]"
                >
                  Date:
                </Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-32 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="due-date"
                  className="text-sm font-medium min-w-[100px]"
                >
                  Due Date:
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-32 h-8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sender and Recipient */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <Label className="text-sm font-medium mb-2 block">From:</Label>
            <Select
              onValueChange={(value) =>
                setSender(getContactById(value) || null)
              }
            >
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Select sender" />
              </SelectTrigger>
              <SelectContent>
                {sampleContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sender && (
              <div className="text-sm text-gray-600">
                <div className="font-medium">{sender.name}</div>
                <div className="whitespace-pre-line">{sender.address}</div>
                <div>{sender.email}</div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">To:</Label>
            <Select
              onValueChange={(value) =>
                setRecipient(getContactById(value) || null)
              }
            >
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {sampleContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recipient && (
              <div className="text-sm text-gray-600">
                <div className="font-medium">{recipient.name}</div>
                <div className="whitespace-pre-line">{recipient.address}</div>
                <div>{recipient.email}</div>
              </div>
            )}
          </div>
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

          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-right p-3 font-medium w-20">Qty</th>
                    <th className="text-right p-3 font-medium w-24">Rate</th>
                    <th className="text-right p-3 font-medium w-24">Amount</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          placeholder="Item description"
                          className="border-0 p-0 h-auto focus-visible:ring-0"
                        />
                      </td>
                      <td className="p-3">
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
                          step="0.01"
                        />
                      </td>
                      <td className="p-3">
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
                          step="0.01"
                        />
                      </td>
                      <td className="p-3 text-right font-medium">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">No items added yet</p>
              <Button
                onClick={addItem}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add Your First Item
              </Button>
            </div>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <span>Tax:</span>
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={(e) =>
                        setTaxRate(Number.parseFloat(e.target.value) || 0)
                      }
                      className="w-16 h-6 text-xs"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-xs">%</span>
                  </div>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
