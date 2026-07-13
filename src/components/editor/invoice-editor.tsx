"use client";

import React, { useCallback, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { useDraftSession } from "@/hooks/use-draft-session";
import Total from "./total";
import Table from "./table";
import Optionsbar from "./optionsbar";
import AddItemPanel from "./add-item-panel";
import InvoiceDetails from "./invoice-details";
import SelectContactModal from "./add-contact-modal";

import {
  DraftInvoice,
  DraftItem,
  InvoiceItem,
  Profile,
} from "@/constants/types";
import { Contact } from "@/lib/contacts";
import { type Product } from "@/lib/products";
import { computeTotal, resolveItem } from "@/lib/invoice";
import { addProduct, removeProduct, setQuantity } from "@/lib/invoice-items";
import { addDays } from "@/lib/utils";

interface InvoiceEditorProps {
  privateContact: Profile;
  contacts: Contact[];
  products: Product[];
  invoiceData: DraftInvoice;
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

  const productById = useMemo(
    () => new Map(productList.map((p) => [p.id, p])),
    [productList]
  );

  const resolve = useCallback(
    (items: DraftItem[]): InvoiceItem[] =>
      items.flatMap((di) => {
        const product = productById.get(di.productId);
        return product ? [resolveItem(di, product)] : [];
      }),
    [productById]
  );

  // Seed estimate total so a stale stored total isn't flagged dirty on open.
  const [seededInvoice] = useState(() => ({
    ...initialInvoice,
    total: computeTotal(resolve(initialInvoice.items)),
  }));

  const session = useDraftSession(seededInvoice);
  const { data: invoiceData, update } = session;

  const setItems = useCallback(
    (mutate: (items: DraftItem[]) => DraftItem[]) =>
      update((prev) => {
        const items = mutate(prev.items);
        return { ...prev, items, total: computeTotal(resolve(items)) };
      }),
    [update, resolve]
  );

  const addItem = useCallback(
    (product: Product) => setItems((items) => addProduct(items, product.id)),
    [setItems]
  );

  const updateItemQty = useCallback(
    (id: number, quantity: number) =>
      setItems((items) => setQuantity(items, id, quantity)),
    [setItems]
  );

  const removeItem = useCallback(
    (id: number) => setItems((items) => removeProduct(items, id)),
    [setItems]
  );

  const resolvedItems = resolve(invoiceData.items);

  const updateContactById = (id: number, name: string) => {
    const contact = contactList.find((contact) => contact.id === id);
    if (!contact) return;
    update((prev) => ({ ...prev, [name]: contact }));
    setIsSendToModalOpen(false);
    setIsInvoiceToModalOpen(false);
  };

  const updateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    update((prev) => ({ ...prev, [name]: value }));
  };

  const setDueFromTerm = (days: number) => {
    update((prev) => ({
      ...prev,
      dueDate: addDays(prev.invoiceDate, days),
    }));
  };

  return (
    <>
      <Optionsbar privateContact={privateContact} session={session} />
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
                  setDueFromTerm={setDueFromTerm}
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
                <AddItemPanel products={productList} addItem={addItem} />
              </div>

              {/* Table */}
              <div>
                <Table
                  items={resolvedItems}
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
              <Total items={resolvedItems} taxRate={invoiceData.taxRate} />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
