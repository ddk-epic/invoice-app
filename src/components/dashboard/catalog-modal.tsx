"use client";

import React, { useState } from "react";

import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { useSearchableList } from "@/hooks/use-searchable-list";

type SheetMode = "new" | "edit";

export interface CatalogRow {
  title: string;
  subtitle: string;
  valueMain: string;
  valueSub: string;
}

interface CatalogModalProps<T> {
  trigger: string;
  title: string;
  newLabel: string;
  items: T[];
  matches: (item: T, query: string) => boolean;
  toRow: (item: T) => CatalogRow;
  groupKey: (item: T) => string;
  renderSheet: (ctx: {
    mode: SheetMode;
    item: T | null;
    close: () => void;
  }) => React.ReactNode;
}

function groupBy<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const arr = groups.get(k) ?? [];
    arr.push(item);
    groups.set(k, arr);
  }
  return [...groups.entries()];
}

export function CatalogModal<T extends { id: number }>({
  trigger,
  title,
  newLabel,
  items,
  matches,
  toRow,
  groupKey,
  renderSheet,
}: CatalogModalProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const [selected, setSelected] = useState<T | null>(null);
  const { query, setQuery, reset, visible, total, noMatches, loadMoreRef } =
    useSearchableList(items, matches);

  const sheetOpen = sheet !== null;

  const openNew = () => {
    setSelected(null);
    setSheet("new");
  };
  const openEdit = (item: T) => {
    if (sheetOpen) return;
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
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-2xl text-teal-700">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 px-4">
          <div className="flex flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5">
            <Search className="size-4 shrink-0 text-gray-400" />
            <input
              autoFocus
              placeholder="Suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Suche löschen"
              tabIndex={query ? 0 : -1}
              className={cn(
                "shrink-0 text-gray-400 hover:text-gray-700",
                !query && "invisible"
              )}
            >
              <X className="size-4" />
            </button>
            <span className="w-[4ch] shrink-0 text-right text-xs text-gray-400 tabular-nums">
              {total}
            </span>
          </div>
          {!sheetOpen && (
            <Button
              size="sm"
              variant="brand"
              onClick={openNew}
              className="gap-1"
            >
              <Plus className="size-4" /> {newLabel}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-scroll">
          {noMatches ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Keine passenden Einträge zu &quot;{query}&quot; gefunden.
            </div>
          ) : (
            groupBy(visible, groupKey).map(([category, rows]) => (
              <div key={category}>
                <div className="sticky top-0 z-10 flex items-center justify-between bg-gray-100/95 px-3 py-1 backdrop-blur">
                  <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    {category}
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {rows.length}
                  </span>
                </div>
                {rows.map((item) => {
                  const r = toRow(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => openEdit(item)}
                      className="flex w-full items-start justify-between px-3 py-2 text-left hover:bg-gray-200"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {r.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {r.subtitle}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium tabular-nums">
                          {r.valueMain}
                        </div>
                        <div className="text-xs text-gray-400">
                          {r.valueSub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
          <div ref={loadMoreRef} className="h-6" />
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
