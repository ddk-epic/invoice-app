"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toEuro } from "@/lib/utils";
import {
  formatBasePrice,
  productMatches,
  weightLabel,
  type Product,
} from "@/lib/products";
import { useSearchableList } from "@/hooks/use-searchable-list";

const PANEL_WIDTH = 540;
const VIEWPORT_PAD = 24;
const NAVBAR_HEIGHT = 64; // fallback for the fixed top navbar (h-16)

function groupByCategory(items: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();
  for (const p of items) {
    const arr = groups.get(p.category) ?? [];
    arr.push(p);
    groups.set(p.category, arr);
  }
  return groups;
}

// Fixed-position anchor: top plus one horizontal edge, left or right per available room.
type DockPosition =
  { top: number; left: number } | { top: number; right: number };

function useDockPosition(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>
) {
  const [pos, setPos] = useState<DockPosition>({ top: 0, left: 0 });
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const measure = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const card = triggerRef.current!.closest(".wrapper");
      const nav = document.querySelector("nav");
      const floor =
        (nav ? nav.getBoundingClientRect().bottom : NAVBAR_HEIGHT) +
        VIEWPORT_PAD;
      const top = Math.max(
        card ? card.getBoundingClientRect().top : floor,
        floor
      );
      const rightRoom = window.innerWidth - rect.right;
      setPos(
        rightRoom >= PANEL_WIDTH + VIEWPORT_PAD
          ? { top, left: rect.right + 8 }
          : { top, right: window.innerWidth - rect.left + 8 }
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, triggerRef]);
  return pos;
}

function useDismiss(
  open: boolean,
  close: () => void,
  refs: React.RefObject<HTMLElement | null>[]
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (refs.some((r) => r.current?.contains(e.target as Node))) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, refs]);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Trap Tab within the panel; restore focus to the trigger on close, but only when
// focus was still inside the panel (an outside click that lands elsewhere keeps it).
function useFocusTrap(
  open: boolean,
  panelRef: React.RefObject<HTMLElement | null>,
  triggerRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panel) return;
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (panel?.contains(document.activeElement)) trigger?.focus();
    };
  }, [open, panelRef, triggerRef]);
}

interface AddItemPanelProps {
  products: Product[];
  addItem: (product: Product) => void;
}

function ItemPicker({ products, addItem }: AddItemPanelProps) {
  const { query, setQuery, visible, total, noMatches, loadMoreRef } =
    useSearchableList(products, productMatches);
  const [chosen, setChosen] = useState<Set<Product["id"]>>(new Set());
  const onAdd = (p: Product) => {
    addItem(p);
    setChosen((prev) => new Set(prev).add(p.id));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <Search className="size-4 shrink-0 text-gray-400" />
        <input
          autoFocus
          placeholder="Artikel suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        <span className="text-xs text-gray-400">{total}</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-1">
        {!noMatches ? (
          [...groupByCategory(visible).entries()].map(([category, items]) => (
            <div key={category}>
              <div className="sticky top-0 z-10 bg-gray-100/95 px-3 py-1 text-xs font-semibold tracking-wide text-gray-500 uppercase backdrop-blur">
                {category}
              </div>
              {items.map((item) => {
                const weight = weightLabel(item);
                const basePrice = formatBasePrice(item);
                const isChosen = chosen.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onAdd(item)}
                    className={`group flex w-full items-center px-3 py-1.5 text-left hover:bg-gray-200 ${
                      isChosen ? "text-gray-400" : ""
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 items-baseline gap-2">
                      <span className="truncate text-sm font-medium">
                        {item.name}
                      </span>
                      {weight && (
                        <span className="shrink-0 text-xs text-gray-400">
                          {weight}
                        </span>
                      )}
                    </span>
                    <span className="w-20 shrink-0 text-right text-xs text-gray-400 tabular-nums">
                      {basePrice}
                    </span>
                    <span className="w-14 shrink-0 text-right text-sm text-gray-600 tabular-nums">
                      {toEuro(item.price)}
                    </span>
                    {isChosen ? (
                      <Check className="ml-3 size-4 shrink-0 text-gray-400" />
                    ) : (
                      <Plus className="ml-3 size-4 shrink-0 text-gray-300 group-hover:text-gray-700" />
                    )}
                  </button>
                );
              })}
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            Keine passenden Artikel zu &quot;{query}&quot; gefunden.
          </div>
        )}
        <div ref={loadMoreRef} className="h-6" />
      </div>
    </div>
  );
}

function AddItemPanel({ products, addItem }: AddItemPanelProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const pos = useDockPosition(open, triggerRef);
  const dismissRefs = useMemo(() => [triggerRef, panelRef], []);
  useDismiss(open, close, dismissRefs);
  useFocusTrap(open, panelRef, triggerRef);

  return (
    <div className="relative inline-block">
      <Button
        ref={triggerRef}
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setOpen((o) => !o)}
      >
        <Plus />
        Artikel hinzufügen
      </Button>
      {open && (
        <div
          ref={panelRef}
          style={{ width: PANEL_WIDTH, bottom: VIEWPORT_PAD, ...pos }}
          className="fixed z-50 overflow-hidden rounded-lg border bg-white text-left shadow-xl"
        >
          <ItemPicker products={products} addItem={addItem} />
        </div>
      )}
    </div>
  );
}

export default AddItemPanel;
