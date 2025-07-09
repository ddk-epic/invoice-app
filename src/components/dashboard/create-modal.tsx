"use client";

import React, { useState } from "react";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { invoiceTemplate } from "@/constants/constants";
import { Contact, InvoiceData } from "@/constants/types";
import { idPrefix } from "@/lib/utils";

import { redirect, RedirectType } from "next/navigation";
import { saveInvoiceChanges } from "@/context/local-storage";
import { Spinner } from "../ui/spinner";

interface CreatInvoiceModalProps {
  invoiceId: string;
  contacts: Contact[];
}

export const CreateInvoiceModal = (props: CreatInvoiceModalProps) => {
  const { invoiceId, contacts } = props;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contactField, setContactField] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const invoiceData: InvoiceData = {
      ...invoiceTemplate,
      invoiceId,
      sendTo: contactField!,
      invoiceTo: contactField!,
    };

    console.log("Creating invoice...", invoiceData);
    saveInvoiceChanges("invoice-data", invoiceData); // save to local storage
    setIsLoading(false);

    redirect("/editor", RedirectType.push);
  };

  const selectContactById = (contactId: string) => {
    const selectedContact = contacts.find(
      (contact) => contact.id.toString() === contactId
    );
    if (!selectedContact) return;
    setContactField(selectedContact);
  };

  return (
    <Dialog
      open={isCreateModalOpen}
      onOpenChange={(open) => {
        if (!open) setTimeout(() => setContactField(null), 300);
        setIsCreateModalOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-white text-purple-600 hover:bg-gray-100">
          <Plus className="mr-1 h-4 w-4" />
          Neue Rechnung erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="w-sm max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Rechnung erstellen</DialogTitle>
          <DialogDescription>
            Die folgenden Angaben werden benötigt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          {/* Client Information */}
          <div className="flex flex-col gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Rechnungsnummer</Label>
                <Input
                  className="font-semibold"
                  id="invoiceNumber"
                  type="string"
                  placeholder={idPrefix(invoiceId)}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Kunde</Label>
                <Select onValueChange={selectContactById} required>
                  <SelectTrigger className="w-full mb-2">
                    <SelectValue
                      id="clientAddress"
                      placeholder="Kontakt auswählen"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem
                        // @ts-ignore
                        key={contact.id}
                        value={contact.id.toString()}
                      >
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {contactField ? (
                <Card className="flex flex-col h-[172px] p-2 text-base text-gray-500 font-normal">
                  <CardContent className="px-1">
                    <div className="font-medium">{contactField.name}</div>
                    <p>{contactField?.owner}</p>
                    <p>{contactField.address?.street}</p>
                    <p>
                      {contactField.address?.zip} {contactField.address?.state}
                    </p>
                    <p>{contactField.address?.country}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex justify-center items-center h-[172px] space-x-2 text-base text-gray-500 border-2 border-dashed rounded-lg">
                  Kundeninformation
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => (
                setIsCreateModalOpen(false),
                setTimeout(() => setContactField(null)),
                300
              )}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center w-38"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="small" /> : "Rechnung erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
