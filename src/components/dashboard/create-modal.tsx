"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { sampleContacts } from "@/constants/constants";
import { Contact } from "@/constants/types";
import { Card, CardContent } from "../ui/card";

export const CreateInvoiceModal = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const allContacts = sampleContacts;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Creating invoice...");
    setIsCreateModalOpen(false);
    // Reset form or show success message
  };

  const selectContactById = (contactId: string) => {
    const selectedContact = allContacts.find(
      (contact) => contact.id === contactId
    );
    if (!selectedContact) return;
    setContact(selectedContact);
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-purple-600 hover:bg-gray-100">
          <Plus className="mr-2 h-4 w-4" />
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
                <Label htmlFor="clientAddress">Kunde</Label>
                <Select onValueChange={selectContactById}>
                  <SelectTrigger className="w-full mb-2">
                    <SelectValue placeholder="Kontakt auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {allContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {contact ? (
                <Card className="flex flex-col h-[172px] p-2 text-base text-gray-500 font-normal">
                  <CardContent className="px-1">
                    <div className="font-medium">{contact.name}</div>
                    <p>{contact?.owner}</p>
                    <p>{contact.address?.street}</p>
                    <p>
                      {contact.address?.zip} {contact.address?.state}
                    </p>
                    <p>{contact.address?.country}</p>
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
                setTimeout(() => setContact(null)),
                500
              )}
            >
              Abbrechen
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Rechnung erstellen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
