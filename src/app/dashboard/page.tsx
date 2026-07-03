import { currentUser } from "@clerk/nextjs/server";

import { getInvoicesContactsProducts } from "../actions/server-actions";
import { InvoiceData } from "@/constants/types";
import {
  buildQueue,
  buildRecentlyPaid,
  groupByDerived,
  sumAmount,
} from "@/lib/invoice-queue";
import { toEuro } from "@/lib/utils";

import { CreateInvoiceModal } from "@/components/dashboard/create-modal";
import {
  ContactsModal,
  ProductsModal,
} from "@/components/dashboard/edit-modal";
import { OpenWorkQueue } from "@/components/dashboard/open-work-queue";

export default async function Dashboard() {
  const [user, { invoiceList, contactList, productList }] = await Promise.all([
    currentUser(),
    getInvoicesContactsProducts(),
  ]);

  const items = buildQueue(invoiceList as InvoiceData[]);
  const recentlyPaid = buildRecentlyPaid(invoiceList as InvoiceData[]);
  const groups = groupByDerived(items);
  const outstanding = sumAmount([...groups.overdue, ...groups.open]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Offene Vorgänge
            </h1>
            <span className="text-sm text-slate-400">
              Hallo {user?.firstName ?? "Benutzer"} · {toEuro(outstanding)}{" "}
              offener Betrag
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ContactsModal contacts={contactList} />
            <ProductsModal products={productList} />
            <CreateInvoiceModal contacts={contactList} />
          </div>
        </div>

        <OpenWorkQueue items={items} recentlyPaid={recentlyPaid} />
      </div>
    </main>
  );
}
