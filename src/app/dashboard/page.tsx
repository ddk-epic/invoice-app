import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

import { getInvoicesContactsProducts } from "../actions/server-actions";
import { buildWorkItems, buildRecentlyPaid } from "@/lib/work-items";

import { CreateInvoiceModal } from "@/components/dashboard/create-modal";
import {
  ContactsModal,
  ProductsModal,
} from "@/components/dashboard/edit-modal";
import { OpenWork } from "@/components/dashboard/open-work";
import { ServerWarnings } from "@/diagnostics/server-warnings";

export default async function Dashboard() {
  const [user, { invoiceList, contactList, productList, droppedProducts }] =
    await Promise.all([currentUser(), getInvoicesContactsProducts()]);

  const items = buildWorkItems(invoiceList);
  const recentlyPaid = buildRecentlyPaid(invoiceList);

  return (
    <main className="min-h-screen bg-slate-50">
      <ServerWarnings droppedProducts={droppedProducts} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Offene Vorgänge
            </h1>
            <span className="text-sm text-slate-400">
              Hallo {user?.firstName ?? "Benutzer"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/invoice"
              className="rounded-md px-2.5 py-1.5 text-sm font-normal text-slate-500 hover:bg-slate-100"
            >
              Alle Rechnungen
            </Link>
            <ContactsModal contacts={contactList} />
            <ProductsModal products={productList} />
            <CreateInvoiceModal contacts={contactList} />
          </div>
        </div>

        <OpenWork items={items} recentlyPaid={recentlyPaid} />
      </div>
    </main>
  );
}
