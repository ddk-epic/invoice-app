"use client";

import React, { useCallback, useRef, useState } from "react";

import { ChevronRightIcon, X } from "lucide-react";
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

import {
  BaseContact,
  BaseInvoiceItem,
  Contact,
  InvoiceItem,
} from "@/constants/types";
import { baseContact, baseItem } from "@/constants/constants";
import { toEuro } from "@/lib/utils";
import {
  insertContactAction,
  insertProductAction,
} from "@/app/actions/server-actions";

function ContactsModal({ contacts }: { contacts: Contact[] }) {
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [contactData, setContactData] = useState<BaseContact>(baseContact);

  const isContactValid =
    contactData.name !== "" &&
    contactData.address.street !== "" &&
    contactData.address.city !== "";

  const handleContactInsert = async (contactData: BaseContact) => {
    const [code, ...cityParts] = contactData.address.city.split(" ");
    const newContactData = {
      ...contactData,
      address: {
        ...contactData.address,
        zip: Number(code),
        city: cityParts.join(),
      },
    };

    const res = await insertContactAction(newContactData);
    console.log("successfully updated products!");
    return res;
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
        if (!open) setTimeout(() => {}, 300);
        setIsContactsModalOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-16 flex-1 justify-between left-0 mx-2 -my-3"
        >
          <div className="text-start space-y-1">
            <div className="text-xl font-bold">Kontakte</div>
            <p className="text-xs text-muted-foreground font-normal">
              {contacts.length} Kontakte
            </p>
          </div>
          <div>
            <ChevronRightIcon />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        <div className="top-0 px-6 pt-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl text-purple-700">
              Kontakte
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="overflow-y-auto px-6">
          <div className="grid">
            <div className="flex justify-between items-center min-w-[450px] p-1 border-t">
              <div className="flex-1 ml-2 space-y-3">
                {contacts.map((contact) => (
                  <div
                    // @ts-ignore
                    key={contact.id}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-gray-500">{contact.type}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-medium">{contact.address.street}</p>
                      <p className="text-sm text-gray-500">{`${contact.address.zip} ${contact.address.city}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Contact Form */}
        <div className="pt-4 pb-7 px-8 text-sm border-t">
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
              <div className="w-32 pt-4.5 space-x-6">
                <Button
                  variant="ghost"
                  onClick={() => handleContactInsert(contactData)}
                  disabled={!isContactValid}
                  className="w-32 purple-gradient text-base text-white"
                >
                  Aktualisieren
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductsModal({ products: productList }: { products: InvoiceItem[] }) {
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(productList);
  const [visibleCount, setVisibleCount] = useState(40);
  const [itemData, setItemData] = useState<InvoiceItem>(baseItem);

  const loaderRef = useCallback(
    (observerDiv: HTMLDivElement | null) => {
      console.log("Observer:", "observerDiv");
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

  const handleProductInsert = async (
    productList: InvoiceItem[],
    itemData: InvoiceItem
  ) => {
    if (itemData.id === 0) {
      itemData.id = Math.random() * 100000; // if new product, give new Id
    } else {
      productList = productList.filter((item) => item.id !== itemData.id);
    }

    const { rate, amount, ...rest } = itemData;
    const newItemData = {
      rate: Number(rate),
      amount: Number(rate),
      ...rest,
    };

    const res = await insertProductAction(productList, newItemData);
    console.log("successfully updated products!");
    return res;
  };

  const updateItemData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const getItemByIdOnClick = (selectedId: number) => {
    console.log("Item ID:", selectedId);
    if (!selectedId) return;

    const selectedItem = filteredItems.find((item) => item.id === selectedId);
    if (!selectedItem) return;

    setItemData(selectedItem);
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
          }, 300);
        setIsProductsModalOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-16 flex-1 justify-between left-0 mx-2 -my-3"
        >
          <div className="text-start space-y-1">
            <div className="text-xl font-bold">Artikel</div>
            <p className="text-xs text-muted-foreground font-normal">
              {productList.length} Artikel
            </p>
          </div>
          <div>
            <ChevronRightIcon />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        <div className="top-0 px-6 pt-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl text-purple-700">
              Alle Artikel
            </DialogTitle>
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
              className="absolute size-7 right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            >
              <X />
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto px-6">
          <div className="flex justify-between items-center min-w-[450px] p-1">
            <div className="flex-1 ml-2 space-y-3">
              {filteredItems.length > 0 ? (
                filteredItems.slice(0, visibleCount).map((item) => (
                  <div
                    // @ts-ignore
                    key={item.id}
                    onClick={() => getItemByIdOnClick(item.id)}
                    className="flex justify-between items-start rounded hover:bg-gray-100"
                  >
                    <div>
                      <h4 className="font-medium">{item.description}</h4>
                      <p className="text-sm text-gray-500">
                        {item.category.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-medium">{toEuro(item.rate)}</p>
                      <p className="text-sm text-gray-500">{item.weight}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Keine passenden Artikel zu "{searchQuery}" gefunden.</p>
                </div>
              )}
              <div
                ref={loaderRef}
                className="h-10 bg-gradient-to-b from-white to-gray-100"
              />
            </div>
          </div>
        </div>
        {/* Product Form */}
        <div className="pt-4 pb-7 px-8 text-sm border-t">
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
              <div className="w-32 pt-4.5 space-x-6">
                <Button
                  variant="ghost"
                  onClick={() => handleProductInsert(productList, itemData)}
                  disabled={!isItemValid}
                  className="w-32 purple-gradient text-base text-white"
                >
                  Aktualisieren
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ContactsModal, ProductsModal };
