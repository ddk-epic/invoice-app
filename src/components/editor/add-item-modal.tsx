"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { weightLabel, formatBasePrice, type Product } from "@/lib/products";
import { toEuro } from "@/lib/utils";
import { useSearchableList } from "@/hooks/use-searchable-list";

interface AddItemModalProps {
  products: Product[];
  addItem: (product: Product) => void;
}

const productMatches = (product: Product, query: string) =>
  product.name.toLowerCase().includes(query.toLowerCase()) ||
  product.category.toLowerCase().includes(query.toLowerCase());

function AddItemModal({ products: productList, addItem }: AddItemModalProps) {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const { query, setQuery, reset, visible, noMatches, loadMoreRef } =
    useSearchableList(productList, productMatches);

  return (
    <Dialog
      open={isAddItemModalOpen}
      onOpenChange={(open) => {
        if (!open) setTimeout(reset, 300);
        setIsAddItemModalOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus />
          Artikel hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[65vh] max-w-2xl flex-col p-0 lg:h-[95vh]">
        <div className="top-0 px-6 pt-6">
          <DialogHeader className="mb-4">
            <DialogTitle>Zu Hinzufügende Artikel auswählen</DialogTitle>
            <DialogDescription>
              Wählen Sie die Artikel aus, die der Rechnung hinzugefügt werden
              sollen.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Input
              placeholder="Artikel suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-3"
            />
            <Button
              variant="ghost"
              onClick={() => setQuery("")}
              className="text-muted-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2 transform"
            >
              <X />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid">
            {!noMatches ? (
              visible.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-[450px] items-center justify-between border-t p-1"
                >
                  <div className="ml-2 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.category.toUpperCase()}
                        </p>
                      </div>
                      <div className="mr-4 text-right">
                        <p className="font-medium">{toEuro(item.price)}</p>
                        <p className="text-sm text-gray-500">
                          {weightLabel(item)}
                          {formatBasePrice(item) &&
                            ` · ${formatBasePrice(item)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => addItem(item)}
                    className="mr-2 flex items-center rounded-full"
                  >
                    <Plus />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>Keine passenden Artikel zu &quot;{query}&quot; gefunden.</p>
              </div>
            )}
            <div
              ref={loadMoreRef}
              className="h-10 bg-gradient-to-b from-white to-gray-100"
            />
          </div>
        </div>
        <div className="flex justify-end border-t py-4 pr-6">
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
