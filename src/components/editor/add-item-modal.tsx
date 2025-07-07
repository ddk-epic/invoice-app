import React, { useState } from "react";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { InvoiceItem } from "@/constants/types";
import { centsToEuro } from "@/lib/utils";

interface AddItemModalProps {
  products: InvoiceItem[];
  addItem: (item: InvoiceItem) => void;
}

function AddItemModal({ products: productList, addItem }: AddItemModalProps) {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = productList.filter(
    (item) =>
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={isAddItemModalOpen}
      onOpenChange={(open) => {
        if (!open) setTimeout(() => setSearchQuery(""), 300);
        setIsAddItemModalOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus />
          Artikel hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[65vh] lg:h-[95vh] flex flex-col p-0">
        <div className="top-0 px-6 pt-6">
          <DialogHeader className="mb-4">
            <DialogTitle>Zu Hinzufügende Artikel auswählen</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Input
              placeholder="Artikel suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  // @ts-ignore
                  key={item.id}
                  className="flex justify-between items-center min-w-[450px] p-1 border-t"
                >
                  <div className="flex-1 ml-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.description}</h4>
                        <p className="text-sm text-gray-500">
                          {item.category.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-medium">{centsToEuro(item.rate)}</p>
                        <p className="text-sm text-gray-500">{item.weight}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => addItem(item)}
                    className="flex items-center rounded-full mr-2"
                  >
                    <Plus />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Keine passenden Artikel zu "{searchQuery}" gefunden.</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end py-4 pr-6 border-t">
          <Button
            variant="outline"
            onClick={() => setIsAddItemModalOpen(false)}
          >
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddItemModal;
