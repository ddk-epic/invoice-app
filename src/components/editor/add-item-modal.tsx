"use client";

import React, { useCallback, useRef, useState } from "react";

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
import { toEuro } from "@/lib/utils";

interface AddItemModalProps {
  products: InvoiceItem[];
  addItem: (item: InvoiceItem) => void;
}

function AddItemModal({ products: productList, addItem }: AddItemModalProps) {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(productList);
  const [visibleCount, setVisibleCount] = useState(40);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loaderRef = useCallback(
    (observerDiv: HTMLDivElement | null) => {
      console.log("Observer:", "observerDiv");
      if (!observerDiv) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 20, filteredItems.length));
        }
      });
      observer.observe(observerDiv);

      return () => observer.disconnect();
    },
    [filteredItems.length]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const filtered = productList.filter(
        (item) =>
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }, 300); // 0.3s delay
  };

  return (
    <Dialog
      open={isAddItemModalOpen}
      onOpenChange={(open) => {
        if (!open)
          setTimeout(() => {
            setSearchQuery("");
            setFilteredItems(productList);
            setVisibleCount(40);
          }, 300);
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
          </DialogHeader>
          <div className="relative">
            <Input
              placeholder="Artikel suchen..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-3"
            />
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2 transform"
            >
              <X />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid">
            {filteredItems.length > 0 ? (
              filteredItems.slice(0, visibleCount).map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-[450px] items-center justify-between border-t p-1"
                >
                  <div className="ml-2 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.description}</h4>
                        <p className="text-sm text-gray-500">
                          {item.category.toUpperCase()}
                        </p>
                      </div>
                      <div className="mr-4 text-right">
                        <p className="font-medium">{toEuro(item.rate)}</p>
                        <p className="text-sm text-gray-500">{item.weight}</p>
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
                <p>
                  Keine passenden Artikel zu &quot;{searchQuery}&quot; gefunden.
                </p>
              </div>
            )}
            <div
              ref={loaderRef}
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
