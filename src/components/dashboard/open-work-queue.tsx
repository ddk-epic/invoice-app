"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Pencil, Trash2 } from "lucide-react";

import { toEuro, deShortDate } from "@/lib/utils";
import {
  Derived,
  QueueItem,
  groupByDerived,
  sumAmount,
} from "@/lib/invoice-queue";
import { bucketLabel, statusLabel } from "@/constants/constants";
import {
  markPaidAction,
  discardDraftAction,
} from "@/app/actions/server-actions";

const STRIPE: Record<Derived, string> = {
  draft: "border-l-amber-400",
  overdue: "border-l-rose-500",
  open: "border-l-slate-300",
  paid: "border-l-emerald-400",
};

function PdfLink({ invoiceId }: { invoiceId: string }) {
  return (
    <Link
      href={`/invoice/${invoiceId}/pdf`}
      aria-label="PDF öffnen"
      className="grid size-8 place-items-center rounded-md text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    >
      PDF
    </Link>
  );
}

function PaidBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-sm font-medium text-white">
      <Check className="size-3.5" /> Bezahlt
    </span>
  );
}

function Row({ item }: { item: QueueItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [settled, setSettled] = useState(false); // optimistic paid confirmation

  const onMarkPaid = () =>
    startTransition(async () => {
      setSettled(true);
      const ok = await markPaidAction(item.id);
      if (ok) {
        toast.success(`Als bezahlt markiert · ${item.client}`);
        router.refresh();
      } else {
        setSettled(false);
        toast.error("Konnte nicht als bezahlt markiert werden");
      }
    });

  const onDelete = () =>
    startTransition(async () => {
      const ok = await discardDraftAction(item.id);
      if (ok) {
        toast.success(`Entwurf gelöscht · ${item.client}`);
        router.refresh();
      } else {
        toast.error("Konnte nicht gelöscht werden");
      }
    });

  const isPaid = item.derived === "paid";
  const dateLabel = isPaid
    ? "Bezahlt"
    : item.derived === "draft"
      ? "Erstellt"
      : "Fällig";
  const dateValue =
    isPaid || item.derived !== "draft"
      ? isPaid
        ? item.updatedAt
        : item.dueDate
      : item.invoiceDate;

  return (
    <div
      className={`group flex items-center gap-4 border-l-[3px] ${STRIPE[item.derived]} bg-white px-4 py-2 transition hover:bg-slate-50`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-slate-900">
            {item.number ?? statusLabel.draft}
          </span>
          {item.derived === "overdue" && (
            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs font-medium text-rose-600">
              {item.daysOverdue} Tage überfällig
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[15px] text-slate-700">
          {item.client}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-xs text-slate-400">{dateLabel}</p>
        <p className="text-sm text-slate-600">{deShortDate(dateValue)}</p>
      </div>

      <div className="w-28 text-right font-semibold text-slate-900 tabular-nums">
        {toEuro(item.amount)}
      </div>

      <div className="flex w-40 justify-end gap-1.5">
        {isPaid ? (
          <>
            <PdfLink invoiceId={item.invoiceId} />
            <PaidBadge />
          </>
        ) : item.derived === "draft" ? (
          <>
            <Link
              href={`/editor/${item.id}`}
              aria-label="Bearbeiten"
              className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil className="size-4" />
            </Link>
            <button
              onClick={onDelete}
              disabled={pending}
              aria-label="Löschen"
              className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        ) : (
          <>
            <PdfLink invoiceId={item.invoiceId} />
            {settled ? (
              <PaidBadge />
            ) : (
              <button
                onClick={onMarkPaid}
                disabled={pending}
                className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Zu Bezahlen
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ label, items }: { label: string; items: QueueItem[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-baseline gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2">
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="text-sm text-slate-400">{items.length}</span>
        <span className="ml-auto text-sm font-medium text-slate-500 tabular-nums">
          {toEuro(sumAmount(items))}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function OpenWorkQueue({
  items,
  recentlyPaid,
}: {
  items: QueueItem[];
  recentlyPaid: QueueItem[];
}) {
  const groups = groupByDerived(items);
  const order: Exclude<Derived, "paid">[] = ["draft", "overdue", "open"];

  if (items.length === 0 && recentlyPaid.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
        Keine offenen Vorgänge — alles erledigt.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {order.map((key) =>
        groups[key].length > 0 ? (
          <Section key={key} label={bucketLabel[key]} items={groups[key]} />
        ) : null
      )}
      {recentlyPaid.length > 0 && (
        <Section label="Kürzlich bezahlt" items={recentlyPaid} />
      )}
    </div>
  );
}
