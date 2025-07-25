import React from "react";

import { FileChartColumn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateInvoiceModal } from "@/components/dashboard/create-modal";
import {
  ContactsModal,
  ProductsModal,
} from "@/components/dashboard/edit-modal";
import InvoiceTable from "@/components/dashboard/invoice-table";

import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { getInvoicesContactsProducts } from "../actions/server-actions";

import { InvoiceData } from "@/constants/types";
import { invoiceStatistics } from "@/constants/constants";

const getLatestInvoiceId = (invoices: InvoiceData[]): number => {
  if (invoices.length === 0) return 1;

  const latestInvoice = invoices.reduce((max, invoice) =>
    invoice.invoiceId > max.invoiceId ? invoice : max
  );
  return parseInt(latestInvoice.invoiceId) + 1;
};

export default async function Dashboard() {
  const user = await currentUser();
  const { invoiceList, contactList, productList } =
    await getInvoicesContactsProducts();
  const latestId = getLatestInvoiceId(invoiceList).toString();

  return (
    <main className="wrapper top min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-0">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Willkommen zurück, {user?.firstName ?? "Benutzer"}!
          </h1>
          <p className="mt-2 text-gray-600">
            Verwalten Sie Rechnungen für Ihr Unternehmen.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:[&>*:first-child]:col-span-2 gap-4 mb-4">
          <Card className="purple-gradient text-white">
            <CardHeader>
              <CardTitle className="text-white">
                Bereit, eine neue Rechnung zu erstellen?
              </CardTitle>
              <CardDescription className="text-purple-100">
                Erstellen Sie professionelle Rechnungen in Minuten!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateInvoiceModal invoiceId={latestId} contacts={contactList} />
            </CardContent>
          </Card>

          <Card className="h-38 gap-6 mb-0">
            <ContactsModal contacts={contactList} />

            <ProductsModal products={productList} />
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {invoiceStatistics.map((item, index) => (
            // @ts-ignore
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.category}
                </CardTitle>
                <FileChartColumn className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kürzlich ausgestellte Rechnungen</CardTitle>
                <CardDescription>
                  Ihre letzte Rechnungsaktivität
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/invoice">Alle ansehen</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <InvoiceTable invoices={invoiceList} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
