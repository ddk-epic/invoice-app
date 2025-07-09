"use client";

import React, { useState } from "react";

import { ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

function ContactsModal() {
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
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
              24 Kontakte
            </p>
          </div>
          <div>
            <ChevronRightIcon />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[65vh] lg:h-[95vh] flex flex-col p-0">
        <div className="top-0 px-6 pt-6">
          <DialogHeader className="mb-4">
            <DialogTitle>Kontakte</DialogTitle>
          </DialogHeader>
          header
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid">
            <div className="flex justify-between items-center min-w-[450px] p-1 border-t">
              <div className="flex-1 ml-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">description</h4>
                    <p className="text-sm text-gray-500">category</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-medium">rate</p>
                    <p className="text-sm text-gray-500">weight</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end py-4 pr-6 border-t">
          <Button
            variant="outline"
            onClick={() => setIsContactsModalOpen(false)}
          >
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductsModal() {
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  return (
    <Dialog
      open={isProductsModalOpen}
      onOpenChange={(open) => {
        if (!open) setTimeout(() => {}, 300);
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
              315 Artikel
            </p>
          </div>
          <div>
            <ChevronRightIcon />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[65vh] lg:h-[95vh] flex flex-col p-0">
        <div className="top-0 px-6 pt-6">
          <DialogHeader className="mb-4">
            <DialogTitle>Artikel</DialogTitle>
          </DialogHeader>
          header
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid">
            <div className="flex justify-between items-center min-w-[450px] p-1 border-t">
              <div className="flex-1 ml-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">description</h4>
                    <p className="text-sm text-gray-500">category</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-medium">rate</p>
                    <p className="text-sm text-gray-500">weight</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end py-4 pr-6 border-t">
          <Button
            variant="outline"
            onClick={() => setIsProductsModalOpen(false)}
          >
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ContactsModal, ProductsModal };
