"use client";

import React, { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import Total from "./total";
import Table from "./table";
import Optionsbar from "./optionsbar";
import AddItemModal from "./add-item-modal";
import InvoiceDetails from "./invoice-details";
import SelectContactModal from "./add-contact-modal";

import { invoiceTemplate } from "@/constants/constants";
import { Contact, InvoiceData, InvoiceItem } from "@/constants/types";
import { getInvoiceChanges, saveInvoiceChanges } from "@/context/local-storage";

interface InvoiceEditorProps {
  contacts: Contact[];
  products: InvoiceItem[];
}

export default function InvoiceEditor(props: InvoiceEditorProps) {
  const { contacts: contactList, products: productList } = props;

  const [isSendToModalOpen, setIsSendToModalOpen] = useState(false);
  const [isInvoiceToModalOpen, setIsInvoiceToModalOpen] = useState(false);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>(invoiceTemplate);

  // on invoice creation
  useEffect(() => {
    const invoice = getInvoiceChanges();
    setInvoiceData(invoice);
  }, []);

  // on data changes
  useEffect(() => {
    saveInvoiceChanges(invoiceData);
  }, [JSON.stringify(invoiceData)]);

  const handleItems = (items: InvoiceItem[]) => {
    setInvoiceData((prev) => ({ ...prev, items }));
  };

  const addItem = (item: InvoiceItem) => {
    const items = invoiceData.items;
    const existingItem = invoiceData.items.find((i) => i.id === item.id);
    if (existingItem) {
      const updatedItems = invoiceData.items.map((i) => {
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
      handleItems(updatedItems);
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
      handleItems([...items, newItem]);
    }
  };

  const updateItemQty = (id: string, quantity: number) => {
    const updatedItems = invoiceData.items.map((i) => {
      if (i.id.toString() === id) {
        const updatedItem = {
          ...i,
          quantity,
          amount: quantity * i.rate,
        };
        return updatedItem;
      }
      return i;
    });
    handleItems(updatedItems);
  };

  const removeItem = (id: string) => {
    handleItems(invoiceData.items.filter((item) => item.id.toString() !== id));
  };

  const updateContactById = (id: string, name: string) => {
    const contact = contactList.find((contact) => contact.id.toString() === id);
    if (!contact) return;
    setInvoiceData((prev) => ({ ...prev, [name]: contact }));
    setIsSendToModalOpen(false);
    setIsInvoiceToModalOpen(false);
  };

  const updateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const updateTotal = (value: number) => {
    setInvoiceData((prev) => ({ ...prev, total: value }));
  };

  return (
    <>
      <Optionsbar id={invoiceData.invoiceId} invoiceData={invoiceData} />

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
                  invoiceData={invoiceData}
                  updateDetails={updateInput}
                />
              </div>
            </div>

            {/* Sender and Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <SelectContactModal
                isModalOpen={isSendToModalOpen}
                setIsModalOpen={setIsSendToModalOpen}
                label="Lieferanschrift"
                name="sendTo"
                contact={invoiceData.sendTo}
                updateContact={updateContactById}
                contactList={contactList}
              />
              <SelectContactModal
                isModalOpen={isInvoiceToModalOpen}
                setIsModalOpen={setIsInvoiceToModalOpen}
                label="Rechnungsadresse"
                name="invoiceTo"
                contact={invoiceData.invoiceTo}
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
                  items={invoiceData.items}
                  updateItemQty={updateItemQty}
                  removeItem={removeItem}
                />
              </div>
              {/* fallback */}
              {invoiceData.items.length === 0 && (
                <div className="text-center py-4 my-2 text-gray-500 border-2 border-dashed rounded-lg">
                  <p>Noch keine Artikel hinzugefügt</p>
                </div>
              )}

              {/* Total */}
              <Total
                items={invoiceData.items}
                taxRate={invoiceData.taxRate}
                total={invoiceData.total}
                setTotal={updateTotal}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
