import React, { useState } from "react";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { InvoiceItem } from "@/constants/types";
import { centsToEuro } from "@/lib/utils";

interface AddItemModalProps {
  products: InvoiceItem[];
  addItem: (item: InvoiceItem) => void;
}

function AddItemModal({ products: productList, addItem }: AddItemModalProps) {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  return (
    <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Artikel hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zu Hinzufügende Artikel auswählen</DialogTitle>
        </DialogHeader>

        <div className="grid">
          {productList.map((item) => (
            <div
              // @ts-ignore
              key={item.id}
              className="flex justify-between items-center min-w-[450px] p-1 border-t"
            >
              <div className="flex-1 ml-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.description}</h4>
                    <p className="text-sm text-gray-500">{item.category}</p>
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
          ))}
        </div>
        <div className="flex justify-end pt-2">
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
