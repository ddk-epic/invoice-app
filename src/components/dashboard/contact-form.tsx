"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { emptyContact, type BaseContact, type Contact } from "@/lib/contacts";
import {
  insertContactAction,
  updateContactAction,
} from "@/app/actions/server-actions";
import { notifyWrite } from "@/diagnostics/notify";

function toFormData(contact: Contact | null): BaseContact {
  if (!contact) return emptyContact();
  return {
    type: contact.type,
    name: contact.name,
    owner: contact.owner ?? "",
    address: {
      ...contact.address,
      city: `${contact.address.zip} ${contact.address.city}`.trim(),
    },
  };
}

interface ContactFormProps {
  mode: "new" | "edit";
  contact: Contact | null;
  onDone: () => void;
}

function ContactForm({ mode, contact, onDone }: ContactFormProps) {
  const router = useRouter();
  const [contactData, setContactData] = useState<BaseContact>(() =>
    toFormData(contact)
  );

  const isContactValid =
    contactData.name !== "" &&
    contactData.address.street !== "" &&
    contactData.address.city !== "";

  const updateContactData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };
  const updateAddressData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleSubmit = async () => {
    const [code, ...cityParts] = contactData.address.city.split(" ");
    const next = {
      ...contactData,
      address: {
        ...contactData.address,
        zip: Number(code),
        city: cityParts.join(),
      },
    };

    const res =
      mode === "edit" && contact
        ? await updateContactAction(contact.id, next)
        : await insertContactAction(next);

    notifyWrite(res, {
      success: "Gespeichert",
      onOk: () => {
        onDone();
        router.refresh();
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between px-8 pt-4">
        <h3 className="font-medium text-gray-700">
          {mode === "new" ? "Neuer Kontakt" : `Bearbeiten: ${contactData.name}`}
        </h3>
        <Button variant="ghost" size="icon" onClick={onDone} className="size-7">
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
                onChange={updateContactData}
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
                onChange={updateContactData}
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
                onChange={updateAddressData}
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
                onChange={updateAddressData}
                className="text-right"
              />
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="flex-grow"></div>
            <div className="flex w-32 items-end pt-4.5">
              <Button
                variant="ghost"
                onClick={handleSubmit}
                disabled={!isContactValid}
                className="w-32 bg-gradient-to-r from-teal-500 to-teal-600 text-base text-white"
              >
                {mode === "new" ? "Anlegen" : "Aktualisieren"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactForm;
