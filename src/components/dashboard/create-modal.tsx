"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";

export const CreateInvoiceModal = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Creating invoice...");
    setIsCreateModalOpen(false);
    // Reset form or show success message
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-purple-600 hover:bg-gray-100">
          <Plus className="mr-2 h-4 w-4" />
          Neue Rechnung erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Rechnung erstellen</DialogTitle>
          <DialogDescription>
            Füllen Sie die folgenden Angaben aus, um eine neue Rechnung zu
            erstellen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          {/* Client Information */}
          <div className="flex flex-col gap-4">
            <div className="space-y-4">
              <h3 className="pt-2 text-lg font-semibold text-purple-600">
                Kundeninformation
              </h3>
              <div className="space-y-2">
                <Label htmlFor="clientName">Kundenname</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Adresse</Label>
                <Input
                  id="clientAddress"
                  type="address"
                  placeholder="123 Global Ave"
                  required
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">
                Rechnungsdetails
              </h3>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Rechnungsnummer</Label>
                <Input id="invoiceNumber" placeholder="INV-001" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Rechnungsdatum</Label>
                <Input id="invoiceDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                <Input id="dueDate" type="date" required />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
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
