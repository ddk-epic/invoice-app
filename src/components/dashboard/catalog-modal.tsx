"use client";

import React, { useState } from "react";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { useSearchableList } from "@/hooks/use-searchable-list";

type SheetMode = "new" | "edit";

interface CatalogModalProps<T> {
  trigger: string;
  title: string;
  newLabel: string;
  items: T[];
  matches: (item: T, query: string) => boolean;
  renderRow: (item: T) => React.ReactNode;
  renderSheet: (ctx: {
    mode: SheetMode;
    item: T | null;
    close: () => void;
  }) => React.ReactNode;
}

export function CatalogModal<T extends { id: number }>({
  trigger,
  title,
  newLabel,
  items,
  matches,
  renderRow,
  renderSheet,
}: CatalogModalProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const [selected, setSelected] = useState<T | null>(null);
  const { query, setQuery, reset, visible, noMatches, loadMoreRef } =
    useSearchableList(items, matches);

  const sheetOpen = sheet !== null;

  const openNew = () => {
    setSelected(null);
    setSheet("new");
  };
  const openEdit = (item: T) => {
    setSelected(item);
    setSheet("edit");
  };
  const close = () => {
    setSheet(null);
    setSelected(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open)
          setTimeout(() => {
            reset();
            close();
          }, 300);
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-md px-2.5 py-1.5 text-sm font-normal text-slate-500 hover:bg-slate-100"
        >
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!sheetOpen}
        className={cn(
          "flex h-[90vh] max-w-2xl flex-col overflow-hidden rounded-xl p-0 transition-none",
          sheetOpen && "border-black/50"
        )}
      >
        <div className="px-6 pt-6">
          <DialogHeader className="mb-4 flex-row items-center justify-between">
            <DialogTitle className="text-2xl text-teal-700">
              {title}
            </DialogTitle>
            {!sheetOpen && (
              <Button size="sm" onClick={openNew} className="mr-6 gap-1">
                <Plus className="size-4" /> {newLabel}
              </Button>
            )}
            <DialogDescription className="sr-only">{title}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Input
              placeholder="Suchen..."
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

        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-2">
            <div className="space-y-1">
              {!noMatches ? (
                visible.map((item) => {
                  const activeRow =
                    sheet === "edit" && selected?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => !sheetOpen && openEdit(item)}
                      className={cn(
                        "relative flex cursor-pointer items-start justify-between rounded px-2 py-1.5 hover:bg-gray-100",
                        activeRow &&
                          "z-30 bg-white shadow-lg ring-2 ring-teal-400"
                      )}
                    >
                      {renderRow(item)}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>
                    Keine passenden Einträge zu &quot;{query}&quot; gefunden.
                  </p>
                </div>
              )}
              <div
                ref={loadMoreRef}
                className="h-10 bg-gradient-to-b from-white to-gray-100"
              />
            </div>
          </div>
        </div>

        {sheetOpen && (
          <div onClick={close} className="absolute inset-0 z-20 bg-black/50" />
        )}

        {sheetOpen && (
          <div className="absolute inset-x-0 bottom-0 z-40 rounded-t-xl border-t bg-white shadow-2xl">
            {renderSheet({ mode: sheet, item: selected, close })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
