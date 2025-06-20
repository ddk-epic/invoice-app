"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { sampleContacts, sampleSender } from "@/constants/constants";
import { Contact, InvoiceItem } from "@/constants/types";
import { SelectContact } from "./select-group";
import Total from "./total";
import Table from "./table";

export default function InvoiceEditor() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");

  const [sender, setSender] = useState<Contact | null>(null);
  const [recipient, setRecipient] = useState<Contact | null>(null);
  const [address, setAddress] = useState<Contact | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const taxRate = 19;

  const addItem = () => {
    const lastItem = items[items.length - 1];
    const newId = lastItem ? Number(lastItem.id) + 1 : 1;

    const newItem: InvoiceItem = {
      id: newId.toString(),
      description: "",
      quantity: 1,
      rate: (Math.floor(Math.random() * 5000) + 1) / 100,
      amount: 0,
    };
    newItem.amount = newItem.quantity * newItem.rate;
    setItems([...items, newItem]);
  };

  const updateItemQty = (id: string, quantity: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            quantity,
            amount: quantity * item.rate,
          };
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

  const updateAddress = (id: string) => {
    const newAddress = sampleContacts.find((contact) => contact.id === id);
    setAddress(newAddress || null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <Card className="wrapper min-w-2xl min-h-[1086px] md:min-h-[1584px] bg-white shadow-lg">
      <div className="py-6 px-12 h-full flex flex-col text-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Rechnung</h1>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label className="font-medium min-w-[160px]">
                  Rechnungsnummer:
                </Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-30 md:w-36 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="font-medium min-w-[160px]">
                  Rechnungsdatum:
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
                <Label className="font-medium min-w-[160px]">
                  Fälligkeitsdatum:
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
            label="Lieferanschrift"
            contact={recipient}
            selectContact={updateRecipient}
            contactList={sampleContacts}
          />
          <SelectContact
            label="Rechnungsadresse"
            contact={address}
            selectContact={updateAddress}
            contactList={sampleContacts}
          />
        </div>

        {/* Invoice Items */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold"></h2>
            <Button
              onClick={addItem}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Artikel hinzufügen
            </Button>
          </div>

          {/* Table */}
          <div className="">
            <Table
              items={items}
              updateItemQty={updateItemQty}
              removeItem={removeItem}
            />
          </div>

          {items.length === 0 && (
            <div className="text-center py-4 my-2 text-gray-500 border-2 border-dashed rounded-lg">
              <p>No items added yet</p>
            </div>
          )}

          {/* Total */}
          <Total
            total={total}
            subtotal={subtotal}
            taxRate={taxRate}
            taxAmount={taxAmount}
          />
        </div>
      </div>
    </Card>
  );
}
