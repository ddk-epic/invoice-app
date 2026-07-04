"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import Total from "./total";
import Table from "./table";
import Optionsbar from "./optionsbar";
import AddItemModal from "./add-item-modal";
import InvoiceDetails from "./invoice-details";
import SelectContactModal from "./add-contact-modal";

import { invoiceTemplate } from "@/constants/constants";
import {
  Contact,
  InvoiceData,
  InvoiceItem,
  PrivateContact,
} from "@/constants/types";
import {
  discardDraftAction,
  updateDraftAction,
} from "@/app/actions/server-actions";
import { computeInvoiceTotal } from "@/lib/invoice";

interface InvoiceEditorProps {
  privateContact: PrivateContact;
  contacts: Contact[];
  products: InvoiceItem[];
  invoiceData?: InvoiceData;
}

export default function InvoiceEditor(props: InvoiceEditorProps) {
  const {
    privateContact,
    contacts: contactList,
    products: productList,
    invoiceData: initialInvoice,
  } = props;

  const [isSendToModalOpen, setIsSendToModalOpen] = useState(false);
  const [isInvoiceToModalOpen, setIsInvoiceToModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialInvoiceData = initialInvoice ?? invoiceTemplate;
  // Seed total from items so a stale stored total isn't flagged dirty on open.
  const initialWithComputedTotal = {
    ...initialInvoiceData,
    total: computeInvoiceTotal(initialInvoiceData.items),
  };

  const [invoiceData, setInvoiceData] = useState<InvoiceData>(
    initialWithComputedTotal
  );

  const router = useRouter();
  const draftId = invoiceData.id;

  // Always-fresh state for timers/listeners.
  const latestRef = useRef(invoiceData);
  useEffect(() => {
    latestRef.current = invoiceData;
  });

  // Snapshot of what's persisted; a differing snapshot means the draft is dirty.
  const lastSavedRef = useRef(JSON.stringify(initialWithComputedTotal));

  const saveDraft = useCallback(
    async (showSpinner: boolean) => {
      if (!draftId) return;
      const current = {
        ...latestRef.current,
        total: computeInvoiceTotal(latestRef.current.items),
      };
      const snapshot = JSON.stringify(current);
      if (snapshot === lastSavedRef.current) return; // not dirty
      if (showSpinner) setIsSaving(true);
      const res = await updateDraftAction(draftId, current);
      if (res.ok) lastSavedRef.current = snapshot;
      if (showSpinner) setIsSaving(false);
    },
    [draftId]
  );

  // Periodic autosave.
  useEffect(() => {
    if (!draftId) return;
    const interval = setInterval(() => saveDraft(true), 10000);
    return () => clearInterval(interval);
  }, [draftId, saveDraft]);

  // Safety clean-up
  useEffect(() => {
    if (!draftId) return;
    const flush = () => saveDraft(false);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [draftId, saveDraft]);

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

  const updateItemQty = (id: number, quantity: number) => {
    const updatedItems = invoiceData.items.map((i) => {
      if (i.id === id) {
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

  const removeItem = (id: number) => {
    handleItems(invoiceData.items.filter((item) => item.id !== id));
  };

  const updateContactById = (id: number, name: string) => {
    const contact = contactList.find((contact) => contact.id === id);
    if (!contact) return;
    setInvoiceData((prev) => ({ ...prev, [name]: contact }));
    setIsSendToModalOpen(false);
    setIsInvoiceToModalOpen(false);
  };

  const updateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const discardData = async () => {
    if (draftId) await discardDraftAction(draftId);
    router.push("/dashboard");
  };

  return (
    <>
      <Optionsbar
        id={invoiceData.invoiceId}
        privateContact={privateContact}
        invoiceData={invoiceData}
        discardData={discardData}
      />
      {isSaving && (
        <div className="fixed right-6 bottom-6">
          <Spinner size="large" className="text-purple-600" />
        </div>
      )}
      <div className="mx-auto max-w-4xl py-4">
        <Card className="wrapper min-h-[1086px] min-w-2xl bg-white shadow-lg md:min-h-[1584px]">
          <div className="flex h-full flex-col px-12 py-6 text-sm">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="mb-4 text-3xl font-bold text-gray-800">
                  Rechnung
                </h1>
                <InvoiceDetails
                  invoiceData={invoiceData}
                  updateDetails={updateInput}
                />
              </div>
            </div>

            {/* Sender and Recipient */}
            <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
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
              <div className="mb-4 flex items-center justify-between">
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
                <div className="my-2 rounded-lg border-2 border-dashed py-4 text-center text-gray-500">
                  <p>Noch keine Artikel hinzugefügt</p>
                </div>
              )}

              {/* Total */}
              <Total items={invoiceData.items} taxRate={invoiceData.taxRate} />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
