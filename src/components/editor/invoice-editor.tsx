"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { useAutosave } from "@/hooks/use-autosave";
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
import { discardDraftAction } from "@/app/actions/server-actions";
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
  const initialWithComputedTotal = {
    ...initialInvoice,
    total: computeTotal(resolve(initialInvoice.items)),
  };

  const [invoiceData, setInvoiceData] = useState<DraftInvoice>(
    initialWithComputedTotal
  );

  const router = useRouter();
  const draftId = invoiceData.id;

  const { status, saving, saveNow, beginDiscard } = useAutosave(invoiceData);

  const setItems = (items: DraftItem[]) => {
    setInvoiceData((prev) => ({
      ...prev,
      items,
      total: computeTotal(resolve(items)),
    }));
  };

  const addItem = (product: Product) =>
    setItems(addProduct(invoiceData.items, product.id));

  const updateItemQty = (id: number, quantity: number) =>
    setItems(setQuantity(invoiceData.items, id, quantity));

  const removeItem = (id: number) =>
    setItems(removeProduct(invoiceData.items, id));

  const resolvedItems = resolve(invoiceData.items);

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

  const setDueFromTerm = (days: number) => {
    setInvoiceData((prev) => ({
      ...prev,
      dueDate: addDays(prev.invoiceDate, days),
    }));
  };

  const discardData = async () => {
    beginDiscard();
    if (draftId) await discardDraftAction(draftId);
    router.push("/dashboard");
  };

  return (
    <>
      <Optionsbar
        privateContact={privateContact}
        invoiceData={invoiceData}
        discardData={discardData}
        saveNow={saveNow}
        status={status}
        saving={saving}
      />
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
