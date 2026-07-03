"use client";

import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { BaseContact, Contact, InvoiceItem } from "@/constants/types";
import { baseContact, baseItem } from "@/constants/constants";
import { toEuro, cn } from "@/lib/utils";
import { invoiceItemToProductInput } from "@/lib/products";
import {
  insertContactAction,
  insertProductAction,
} from "@/app/actions/server-actions";

function ContactsModal({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [contactData, setContactData] = useState<BaseContact>(baseContact);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Which contact surface is open in the bottom sheet: none, a fresh contact,
  // or an existing one being edited. `sheet !== null` dims the list.
  const [sheet, setSheet] = useState<null | "new" | "edit">(null);
  const dim = sheet !== null;

  const isContactValid =
    contactData.name !== "" &&
    contactData.address.street !== "" &&
    contactData.address.city !== "";

  const openNewContact = () => {
    setContactData(baseContact);
    setSelectedId(null);
    setSheet("new");
  };

  const openEditContact = (contact: Contact) => {
    setContactData({
      type: contact.type,
      name: contact.name,
      owner: contact.owner ?? "",
      address: {
        ...contact.address,
        city: `${contact.address.zip} ${contact.address.city}`.trim(),
      },
    });
    setSelectedId(contact.id);
    setSheet("edit");
  };

  const closeSheet = () => setSheet(null);

  const handleContactInsert = async () => {
    const [code, ...cityParts] = contactData.address.city.split(" ");
    const newContactData = {
      ...contactData,
      address: {
        ...contactData.address,
        zip: Number(code),
        city: cityParts.join(),
      },
    };

    await insertContactAction(newContactData);
    closeSheet();
    router.refresh();
  };

  const updateContactData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };
  const updateAddressData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  return (
    <Dialog
      open={isContactsModalOpen}
      onOpenChange={(open) => {
        if (!open)
          setTimeout(() => {
            setContactData(baseContact);
            setSheet(null);
          }, 300);
        setIsContactsModalOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-md px-2.5 py-1.5 text-sm font-normal text-slate-500 hover:bg-slate-100"
        >
          Kontakte
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!dim}
        className={cn(
          "flex h-[90vh] max-w-2xl flex-col overflow-hidden rounded-xl p-0 transition-none",
          dim && "border-black/50"
        )}
      >
        <div className="px-6 pt-6">
          <DialogHeader className="mb-4 flex-row items-center justify-between">
            <DialogTitle className="text-2xl text-teal-700">
              Kontakte
            </DialogTitle>
            {!dim && (
              <Button size="sm" onClick={openNewContact} className="mr-6 gap-1">
                <Plus className="size-4" /> Neuer Kontakt
              </Button>
            )}
          </DialogHeader>
        </div>

        {/* Contact list */}
        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-2">
            <div className="space-y-1">
              {contacts.map((contact) => {
                const lifted = sheet === "edit" && selectedId === contact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => !dim && openEditContact(contact)}
                    className={cn(
                      "relative flex cursor-pointer items-start justify-between rounded px-2 py-1.5 hover:bg-gray-100",
                      lifted && "z-30 bg-white shadow-lg ring-2 ring-teal-400"
                    )}
                  >
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-gray-500">{contact.type}</p>
                    </div>
                    <div className="mr-2 text-right">
                      <p className="font-medium">{contact.address.street}</p>
                      <p className="text-sm text-gray-500">{`${contact.address.zip} ${contact.address.city}`}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrim over the whole modal */}
        {dim && (
          <div
            onClick={closeSheet}
            className="absolute inset-0 z-20 bg-black/50"
          />
        )}

        {/* Bottom sheet */}
        {dim && (
          <div className="absolute inset-x-0 bottom-0 z-40 rounded-t-xl border-t bg-white shadow-2xl">
            <div className="flex items-center justify-between px-8 pt-4">
              <h3 className="font-medium text-gray-700">
                {sheet === "new"
                  ? "Neuer Kontakt"
                  : `Bearbeiten: ${contactData.name}`}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSheet}
                className="size-7"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="px-8 pt-2 pb-6 text-sm">
              <div className="space-y-2">
                <div className="flex space-x-6">
                  <div className="flex-grow">
                    <Label className="pb-1">Client</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Client"
                      value={contactData.name}
                      onChange={(e) => updateContactData(e)}
                    />
                  </div>
                  <div className="w-40">
                    <Label className="pb-1">Besitzer</Label>
                    <Input
                      id="owner"
                      name="owner"
                      type="text"
                      placeholder="Besitzer"
                      value={contactData.owner}
                      onChange={(e) => updateContactData(e)}
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="flex space-x-6">
                  <div className="flex-grow">
                    <Label className="pb-1">Straße</Label>
                    <Input
                      id="street"
                      name="street"
                      type="text"
                      placeholder="Straße"
                      value={contactData.address.street}
                      onChange={(e) => updateAddressData(e)}
                    />
                  </div>
                  <div className="w-40">
                    <Label className="pb-1">ZIP City</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="72764 Reutlingen"
                      value={contactData.address.city}
                      onChange={(e) => updateAddressData(e)}
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="flex space-x-6">
                  <div className="flex-grow"></div>
                  <div className="flex w-32 items-end pt-4.5">
                    <Button
                      variant="ghost"
                      onClick={handleContactInsert}
                      disabled={!isContactValid}
                      className="w-32 bg-gradient-to-r from-teal-500 to-teal-600 text-base text-white"
                    >
                      {sheet === "new" ? "Anlegen" : "Aktualisieren"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProductsModal({ products: productList }: { products: InvoiceItem[] }) {
  const router = useRouter();
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(productList);
  const [visibleCount, setVisibleCount] = useState(40);
  const [itemData, setItemData] = useState<InvoiceItem>(baseItem);

  // Which product surface is open in the bottom sheet: none, a fresh product,
  // or an existing one being edited. `sheet !== null` dims the catalog.
  const [sheet, setSheet] = useState<null | "new" | "edit">(null);
  const dim = sheet !== null;

  const loaderRef = useCallback(
    (observerDiv: HTMLDivElement | null) => {
      if (!observerDiv) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 20, filteredItems.length));
        }
      });
      observer.observe(observerDiv);

      return () => observer.disconnect();
    },
    [filteredItems.length]
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isItemValid =
    itemData.description !== "" &&
    itemData.category !== "" &&
    itemData.brand !== "" &&
    itemData.rate !== 0;

  const openNewProduct = () => {
    setItemData(baseItem);
    setSheet("new");
  };

  const openEditProduct = (item: InvoiceItem) => {
    setItemData(item);
    setSheet("edit");
  };

  const closeSheet = () => setSheet(null);

  const handleProductInsert = async () => {
    // id > 0 => update existing catalog row; otherwise insert a new one
    await insertProductAction(invoiceItemToProductInput(itemData));
    closeSheet();
    router.refresh();
  };

  const updateItemData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const filtered = productList.filter(
        (item) =>
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }, 300); // 0.3s delay
  };

  return (
    <Dialog
      open={isProductsModalOpen}
      onOpenChange={(open) => {
        if (!open)
          setTimeout(() => {
            setSearchQuery("");
            setItemData(baseItem);
            setFilteredItems(productList);
            setVisibleCount(40);
            setSheet(null);
          }, 300);
        setIsProductsModalOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-md px-2.5 py-1.5 text-sm font-normal text-slate-500 hover:bg-slate-100"
        >
          Artikel
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!dim}
        className={cn(
          "flex h-[90vh] max-w-2xl flex-col overflow-hidden rounded-xl p-0 transition-none",
          dim && "border-black/50"
        )}
      >
        <div className="px-6 pt-6">
          <DialogHeader className="mb-4 flex-row items-center justify-between">
            <DialogTitle className="text-2xl text-teal-700">
              Alle Artikel
            </DialogTitle>
            {!dim && (
              <Button size="sm" onClick={openNewProduct} className="mr-6 gap-1">
                <Plus className="size-4" /> Neuer Artikel
              </Button>
            )}
          </DialogHeader>
          <div className="relative">
            <Input
              placeholder="Artikel suchen..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-3"
            />
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2 transform"
            >
              <X />
            </Button>
          </div>
        </div>

        {/* Catalog */}
        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-2">
            <div className="space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.slice(0, visibleCount).map((item) => {
                  const lifted = sheet === "edit" && itemData.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => !dim && openEditProduct(item)}
                      className={cn(
                        "relative flex cursor-pointer items-start justify-between rounded px-2 py-1.5 hover:bg-gray-100",
                        lifted && "z-30 bg-white shadow-lg ring-2 ring-teal-400"
                      )}
                    >
                      <div>
                        <h4 className="font-medium">{item.description}</h4>
                        <p className="text-sm text-gray-500">
                          {item.category.toUpperCase()}
                        </p>
                      </div>
                      <div className="mr-2 text-right">
                        <p className="font-medium">{toEuro(item.rate)}</p>
                        <p className="text-sm text-gray-500">{item.weight}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>
                    Keine passenden Artikel zu &quot;{searchQuery}&quot;
                    gefunden.
                  </p>
                </div>
              )}
              <div
                ref={loaderRef}
                className="h-10 bg-gradient-to-b from-white to-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Scrim over the whole modal */}
        {dim && (
          <div
            onClick={closeSheet}
            className="absolute inset-0 z-20 bg-black/50"
          />
        )}

        {/* Bottom sheet */}
        {dim && (
          <div className="absolute inset-x-0 bottom-0 z-40 rounded-t-xl border-t bg-white shadow-2xl">
            <div className="flex items-center justify-between px-8 pt-4">
              <h3 className="font-medium text-gray-700">
                {sheet === "new"
                  ? "Neuer Artikel"
                  : `Bearbeiten: ${itemData.description}`}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSheet}
                className="size-7"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="px-8 pt-2 pb-6 text-sm">
              <div className="space-y-2">
                <div className="flex space-x-6">
                  <div className="flex-grow">
                    <Label className="pb-1">Beschreibung</Label>
                    <Input
                      id="description"
                      name="description"
                      type="text"
                      placeholder="Beschreibung"
                      value={itemData.description}
                      onChange={(e) => updateItemData(e)}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="pb-1">Preis</Label>
                    <Input
                      id="rate"
                      name="rate"
                      type="text"
                      placeholder="Preis"
                      value={itemData.rate.toString()}
                      onChange={(e) => updateItemData(e)}
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="flex space-x-6">
                  <div className="flex-grow">
                    <Label className="pb-1">Kategorie</Label>
                    <Input
                      id="category"
                      name="category"
                      type="text"
                      placeholder="Kategorie"
                      value={itemData.category}
                      onChange={(e) => updateItemData(e)}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="pb-1">Gewicht / Volumen</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="text"
                      placeholder="Gewicht / Vol..."
                      value={itemData.weight}
                      onChange={(e) => updateItemData(e)}
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="flex space-x-6">
                  <div className="flex-grow">
                    <Label className="pb-1">Marke</Label>
                    <Input
                      id="brand"
                      name="brand"
                      type="text"
                      placeholder="Marke"
                      value={itemData.brand}
                      onChange={(e) => updateItemData(e)}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="pb-1">Boxanzahl</Label>
                    <Input
                      id="box"
                      name="box"
                      type="text"
                      placeholder="Boxanzahl"
                      value={itemData.perBox}
                      onChange={(e) => updateItemData(e)}
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="flex space-x-6">
                  <div className="flex-grow">
                    <Label className="pb-1">Herkunft</Label>
                    <Input
                      id="origin"
                      name="origin"
                      type="text"
                      placeholder="Herkunft"
                      value={itemData.origin}
                      onChange={(e) => updateItemData(e)}
                    />
                  </div>
                  <div className="flex w-32 items-end pt-4.5">
                    <Button
                      variant="ghost"
                      onClick={handleProductInsert}
                      disabled={!isItemValid}
                      className="w-32 bg-gradient-to-r from-teal-500 to-teal-600 text-base text-white"
                    >
                      {sheet === "new" ? "Anlegen" : "Aktualisieren"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { ContactsModal, ProductsModal };
