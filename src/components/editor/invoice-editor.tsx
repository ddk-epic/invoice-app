"use client";

import React, { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import Total from "./total";
import Table from "./table";
import Optionsbar from "./optionsbar";
import AddItemModal from "./add-item-modal";
import InvoiceDetails from "./invoice-details";
import SelectContactModal from "./add-contact-modal";

import { empty, invoiceTemplate } from "@/constants/constants";
import { Contact, InvoiceData, InvoiceItem } from "@/constants/types";
import {
  deleteInvoiceChanges,
  getInvoiceChanges,
  saveInvoiceChanges,
} from "@/context/local-storage";

interface InvoiceEditorProps {
  contacts: Contact[];
  products: InvoiceItem[];
}

export default function InvoiceEditor(props: InvoiceEditorProps) {
  const { contacts: contactList, products: productList } = props;

  const [isSendToModalOpen, setIsSendToModalOpen] = useState(false);
  const [isInvoiceToModalOpen, setIsInvoiceToModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>(invoiceTemplate);

  // Load saved invoice on initial mount
  useEffect(() => {
    let savedInvoice = getInvoiceChanges("invoice-data");
    console.log("data", savedInvoice);
    if (savedInvoice) setInvoiceData(savedInvoice);
  }, []);

  // Save to localStorage after 2s of no input
  useEffect(() => {
    setIsSaving(true);

    const timeout = setTimeout(() => {
      saveInvoiceChanges("invoice-data", invoiceData);
      setIsSaving(false);
    }, 2000); // 2 seconds

    // debounce: clear timeout if data changes before 2s
    return () => clearTimeout(timeout);
  }, [
    invoiceData.invoiceId,
    invoiceData.invoiceDate,
    invoiceData.dueDate,
    JSON.stringify(invoiceData.sendTo),
    JSON.stringify(invoiceData.invoiceTo),
    JSON.stringify(invoiceData.items),
  ]);

  const handleItems = (items: InvoiceItem[]) => {
    setInvoiceData((prev) => ({ ...prev, items }));
  };

  const addItem = (item: InvoiceItem) => {
    const items = invoiceData.items;
    const itemIndex = items.findIndex((i) => i.id === item.id);

    if (itemIndex !== -1) {
      const updatedItem = {
        ...items[itemIndex],
        quantity: items[itemIndex].quantity + 1,
        amount: (items[itemIndex].quantity + 1) * items[itemIndex].rate,
      };

      // should be better than mapping
      const updatedItems = [
        ...items.slice(0, itemIndex),
        updatedItem,
        ...items.slice(itemIndex + 1),
      ];
      handleItems(updatedItems);
    } else {
      const newItem: InvoiceItem = {
        ...item,
        brand: item?.brand ?? "",
        weight: item?.weight ?? "",
        perBox: item?.perBox || 0,
        quantity: 1,
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

  const discardData = () => {
    console.log("deleting current data...");
    deleteInvoiceChanges("invoice-data");
    setInvoiceData((prev) => ({
      ...prev,
      dueDate: "",
      sendTo: empty,
      invoiceTo: empty,
      items: [],
    }));
  };

  return (
    <>
      <Optionsbar
        id={invoiceData.invoiceId}
        invoiceData={invoiceData}
        discardData={discardData}
      />
      {isSaving && (
        <div className="fixed right-6 bottom-6">
          <Spinner size="large" className="text-purple-600" />
        </div>
      )}
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
