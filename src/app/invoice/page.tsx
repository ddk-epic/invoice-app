import Link from "next/link";
import { redirect } from "next/navigation";

import { statusLabel } from "@/lib/invoice";
import type { InvoiceStatus } from "@/constants/types";

import { QUERIES } from "@/server/db/queries";
import { toEuro, deShortDate, idPrefix } from "@/lib/utils";

const PAGE_SIZE = 25;

const STRIPE: Record<InvoiceStatus, string> = {
  draft: "border-l-amber-400",
  overdue: "border-l-rose-500",
  open: "border-l-slate-300",
  paid: "border-l-emerald-400",
};

const PILL: Record<InvoiceStatus, string> = {
  draft: "bg-amber-50 text-amber-700",
  overdue: "bg-rose-50 text-rose-600",
  open: "bg-slate-100 text-slate-600",
  paid: "bg-emerald-50 text-emerald-700",
};

interface InvoiceViewAllProps {
  searchParams: Promise<{ page?: string }>;
}

async function InvoiceViewAll({ searchParams }: InvoiceViewAllProps) {
  const { page: pageParam } = await searchParams;

  const total = await QUERIES.countInvoices();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const requested = Number(pageParam);
  const page = Math.min(
    Math.max(1, Number.isInteger(requested) ? requested : 1),
    totalPages
  );
  // Bare /invoice stays page 1; only a junk/out-of-range param gets normalized.
  if (pageParam !== undefined && pageParam !== String(page)) {
    redirect(`/invoice?page=${page}`);
  }

  const invoiceList = await QUERIES.getInvoicesPage(page, PAGE_SIZE);
  const pageSum = invoiceList.reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Alle Rechnungen
            </h1>
            <span className="text-sm text-slate-400">{total}</span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-md px-2.5 py-1.5 text-sm font-normal text-slate-500 hover:bg-slate-100"
          >
            Offene Vorgänge
          </Link>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-baseline gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2">
            <h2 className="text-sm font-semibold text-slate-700">Rechnungen</h2>
            <span className="text-sm text-slate-400">{invoiceList.length}</span>
            <span className="ml-auto text-sm font-medium text-slate-500 tabular-nums">
              {toEuro(pageSum)}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {invoiceList.map((invoice) => (
              <div
                key={invoice.id}
                className={`flex items-center gap-4 border-l-[3px] ${STRIPE[invoice.status]} bg-white px-4 py-2 transition hover:bg-slate-50`}
              >
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {invoice.invoiceId
                      ? idPrefix(invoice.invoiceId)
                      : statusLabel.draft}
                  </span>
                  <p className="mt-0.5 truncate text-[15px] text-slate-700">
                    {invoice.client}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate-400">Datum</p>
                  <p className="text-sm text-slate-600">
                    {deShortDate(invoice.createdAt)}
                  </p>
                </div>

                <div className="w-28 text-right font-semibold text-slate-900 tabular-nums">
                  {toEuro(invoice.total)}
                </div>

                <div className="flex w-28 justify-end">
                  <span
                    className={`inline-flex rounded-md px-2.5 py-1.5 text-sm font-medium ${PILL[invoice.status]}`}
                  >
                    {statusLabel[invoice.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-400">
              Seite {page} von {totalPages}
            </span>
            <div className="flex gap-1.5">
              {page > 1 ? (
                <Link
                  href={`/invoice?page=${page - 1}`}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Zurück
                </Link>
              ) : (
                <span className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-300">
                  Zurück
                </span>
              )}
              {page < totalPages ? (
                <Link
                  href={`/invoice?page=${page + 1}`}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Weiter
                </Link>
              ) : (
                <span className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-300">
                  Weiter
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default InvoiceViewAll;
