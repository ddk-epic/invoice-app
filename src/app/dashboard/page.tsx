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

import { invoiceStatistics } from "@/constants/constants";

export default async function Dashboard() {
  const user = await currentUser();
  const { invoiceList, contactList, productList } =
    await getInvoicesContactsProducts();

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
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:[&>*:first-child]:col-span-2">
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
              <CreateInvoiceModal contacts={contactList} />
            </CardContent>
          </Card>

          <Card className="mb-0 h-38 gap-6">
            <ContactsModal contacts={contactList} />

            <ProductsModal products={productList} />
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {invoiceStatistics.map((item, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.category}
                </CardTitle>
                <FileChartColumn className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-muted-foreground text-xs">{item.comment}</p>
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
