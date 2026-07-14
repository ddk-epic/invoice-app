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
    address: { ...contact.address },
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
    contactData.address.zip !== "" &&
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
    const res =
      mode === "edit" && contact
        ? await updateContactAction(contact.id, contactData)
        : await insertContactAction(contactData);

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
      <div className="flex items-center justify-between px-6 pt-3">
        <h3 className="font-medium text-gray-700">
          {mode === "new" ? "Neuer Kontakt" : `Bearbeiten: ${contactData.name}`}
        </h3>
        <Button variant="ghost" size="icon" onClick={onDone} className="size-7">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex gap-6 px-6 pt-2 pb-6 text-sm">
        {/* Identity */}
        <div className="min-w-0 flex-1 space-y-3">
          <p className="pt-4 pb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Identität
          </p>
          <div>
            <Label className="pb-1">Client</Label>
            <Input
              name="name"
              placeholder="z.B. Müller GmbH"
              value={contactData.name}
              onChange={updateContactData}
            />
          </div>
          <div>
            <Label className="pb-1 text-gray-500">Besitzer</Label>
            <Input
              name="owner"
              placeholder="z.B. Anna Müller"
              value={contactData.owner}
              onChange={updateContactData}
            />
          </div>
        </div>

        {/* Address */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="pt-4 pb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Adresse
          </p>
          <div>
            <Label className="pb-1">Straße</Label>
            <Input
              name="street"
              placeholder="z.B. Hauptstraße 12"
              value={contactData.address.street}
              onChange={updateAddressData}
            />
          </div>
          <div>
            <Label className="pb-1">PLZ / Ort</Label>
            <div className="focus-within:border-ring focus-within:ring-ring/50 flex h-9 min-w-0 items-stretch overflow-hidden rounded-md border shadow-xs focus-within:ring-[3px]">
              <input
                name="zip"
                inputMode="numeric"
                placeholder="72764"
                value={contactData.address.zip}
                onChange={updateAddressData}
                className="w-16 min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400"
              />
              <input
                name="city"
                placeholder="z.B. Reutlingen"
                value={contactData.address.city}
                onChange={updateAddressData}
                className="min-w-0 flex-1 border-l bg-transparent px-3 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <Label className="invisible pb-1">.</Label>
            <Button
              variant="brand"
              onClick={handleSubmit}
              disabled={!isContactValid}
              className="w-full text-base"
            >
              {mode === "new" ? "Anlegen" : "Aktualisieren"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactForm;
