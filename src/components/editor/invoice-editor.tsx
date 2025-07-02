"use client";

import React, { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import Total from "./total";
import Table from "./table";
import Optionsbar from "./optionsbar";
import AddItemModal from "./add-item-modal";
import InvoiceDetails from "./invoice-details";
import SelectContactModal from "./add-contact-modal";

import { Contact, InvoiceData, InvoiceItem } from "@/constants/types";
import { getSavedInvoice } from "@/context/local-storage";

const sender = {
  id: 1,
  type: "admin",
  name: "Maxima",
  owner: "phtt",
  address: {
    street: "123 London street",
    city: "Hamburg",
    state: "HA",
    zip: "77777",
    country: "GER",
  },
};

interface InvoiceEditorProps {
  contacts: Contact[];
  products: InvoiceItem[];
}

export default function InvoiceEditor(props: InvoiceEditorProps) {
  const { contacts: contactList, products: productList } = props;

  const [isSendToModalOpen, setIsSendToModalOpen] = useState(false);
  const [isInvoiceToModalOpen, setIsInvoiceToModalOpen] = useState(false);

  const [invoiceId, setInvoiceId] = useState<number>(0);
  const [sendTo, setSendTo] = useState<Contact | null>(null);
  const [invoiceTo, setInvoiceTo] = useState<Contact | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const taxRate = 19;

  // on invoice creation
  useEffect(() => {
    const invoice = getSavedInvoice();

    setInvoiceId(invoice.invoiceId);
    setSendTo(invoice.sendTo);
    setInvoiceTo(invoice.invoiceTo);
  }, []);

  const addItem = (item: InvoiceItem) => {
    const existingItem = items.find((i) => i.id === item.id);
    if (existingItem) {
      const updatedItem = items.map((i) => {
        if (i.id === item.id) {
          const newQuantity = i.quantity + 1;
          return {
            ...i,
            quantity: newQuantity,
            amount: newQuantity * i.rate,
          };
        }
        return i;
      });
      setItems(updatedItem);
    } else {
      const newItem: InvoiceItem = {
        id: item.id,
        category: item.category,
        description: item.description,
        brand: item?.brand ?? "",
        weight: item?.weight ?? "",
        perBox: item?.perBox,
        quantity: 1,
        rate: item.rate,
        amount: item.rate,
      };
      setItems([...items, newItem]);
    }
  };

  const updateItemQty = (id: string, quantity: number) => {
    setItems(
      items.map((item) => {
        if (item.id.toString() === id) {
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
    setItems(items.filter((item) => item.id.toString() !== id));
  };

  const updateContactById = (
    id: string,
    setter: (contact: Contact) => void
  ) => {
    const contact = contactList.find((contact) => contact.id.toString() === id);
    if (!contact) return;
    setter(contact);
    setIsSendToModalOpen(false);
    setIsInvoiceToModalOpen(false);
  };

  const getInvoiceData = (): InvoiceData => {
    return {
      id: 0,
      invoiceId: invoiceId,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      status: "open",

      sender,
      sendTo: sendTo ?? sender,
      invoiceTo: invoiceTo ?? sender,

      items,
      total,
      taxRate,

      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const invoiceData: InvoiceData = getInvoiceData();

  return (
    <>
      <Optionsbar id={invoiceId} invoiceData={invoiceData} />

      <div className="max-w-4xl py-4 mx-auto">
        <Card className="wrapper min-w-2xl min-h-[1086px] md:min-h-[1584px] bg-white shadow-lg">
          <div className="py-6 px-12 h-full flex flex-col text-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Rechnung
                </h1>
                <InvoiceDetails
                  invoiceId={invoiceId}
                  setInvoiceId={setInvoiceId}
                />
              </div>
            </div>

            {/* Sender and Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <SelectContactModal
                isModalOpen={isSendToModalOpen}
                setIsModalOpen={setIsSendToModalOpen}
                label="Lieferanschrift"
                contact={sendTo}
                setter={setSendTo}
                updateContact={updateContactById}
                contactList={contactList}
              />
              <SelectContactModal
                isModalOpen={isInvoiceToModalOpen}
                setIsModalOpen={setIsInvoiceToModalOpen}
                label="Rechnungsadresse"
                contact={invoiceTo}
                setter={setInvoiceTo}
                updateContact={updateContactById}
                contactList={contactList}
              />
            </div>

            <div className="flex-1">
              {/* Invoice Items */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{/*Items*/}</h2>
                <AddItemModal products={productList} addItem={addItem} />
              </div>

              {/* Table */}
              <div>
                <Table
                  items={items}
                  updateItemQty={updateItemQty}
                  removeItem={removeItem}
                />
              </div>
              {/* fallback */}
              {items.length === 0 && (
                <div className="text-center py-4 my-2 text-gray-500 border-2 border-dashed rounded-lg">
                  <p>Noch keine Artikel hinzugefügt</p>
                </div>
              )}

              {/* Total */}
              <Total
                items={items}
                taxRate={taxRate}
                total={total}
                setTotal={setTotal}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
