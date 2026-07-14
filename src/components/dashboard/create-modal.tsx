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

import { Contact } from "@/lib/contacts";

import { redirect, RedirectType } from "next/navigation";
import { notifyError } from "@/diagnostics/notify";
import { createDraftAction } from "@/app/actions/server-actions";
import { Spinner } from "../ui/spinner";

interface CreatInvoiceModalProps {
  contacts: Contact[];
}

export const CreateInvoiceModal = (props: CreatInvoiceModalProps) => {
  const { contacts } = props;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contactField, setContactField] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const draftId = await createDraftAction({ contactId: contactField!.id });
    if (draftId == null) {
      setIsLoading(false);
      notifyError("Rechnung konnte nicht erstellt werden.");
      return;
    }

    redirect(`/editor/${draftId}`, RedirectType.push);
  };

  const selectContactById = (contactId: string) => {
    const selectedContact = contacts.find(
      (contact) => contact.id === Number(contactId)
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
        <Button
          variant="brand"
          className="ml-1 inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-semibold"
        >
          <Plus className="size-4" />
          Neue Rechnung
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] w-sm overflow-y-auto">
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
                  placeholder="(wird vergeben)"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Kunde</Label>
                <Select onValueChange={selectContactById} required>
                  <SelectTrigger className="mb-2 w-full">
                    <SelectValue
                      id="clientAddress"
                      placeholder="Kontakt auswählen"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem
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
                <Card className="flex h-[172px] flex-col p-2 text-base font-normal text-gray-500">
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
                <div className="flex h-[172px] items-center justify-center space-x-2 rounded-lg border-2 border-dashed text-base text-gray-500">
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
              variant="brand"
              className="flex w-38 items-center justify-center"
              disabled={isLoading || contactField == null}
            >
              {isLoading ? <Spinner size="small" /> : "Rechnung erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
