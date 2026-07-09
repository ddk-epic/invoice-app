import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getStatusColor, statusLabel } from "@/constants/constants";

import { QUERIES } from "@/server/db/queries";
import { toEuro, deShortDate, idPrefix } from "@/lib/utils";

const PAGE_SIZE = 25;

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
  return (
    <main className="wrapper top min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-0">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Alle Rechnungen</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rechnungs ID</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceList.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceId
                        ? idPrefix(invoice.invoiceId)
                        : "Entwurf"}
                    </TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{toEuro(invoice.total)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {statusLabel[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{deShortDate(invoice.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between pt-4">
              <span className="text-muted-foreground text-sm">
                Seite {page} von {totalPages}
              </span>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/invoice?page=${page - 1}`}>Zurück</Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Zurück
                  </Button>
                )}
                {page < totalPages ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/invoice?page=${page + 1}`}>Weiter</Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Weiter
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default InvoiceViewAll;
