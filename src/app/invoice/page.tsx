import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { InvoiceData } from "@/constants/types";
import { getStatusColor } from "@/constants/constants";

import { QUERIES } from "@/server/db/queries";
import { toEuro, deShortDate, idPrefix } from "@/lib/utils";

async function InvoiceViewAll() {
  const invoiceList = (await QUERIES.getAllInvoices()) as InvoiceData[];
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
                  // @ts-ignore
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {idPrefix(invoice.invoiceId)}
                    </TableCell>
                    <TableCell>{invoice.sendTo.name}</TableCell>
                    <TableCell>{toEuro(invoice.total)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {deShortDate(new Date(invoice.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default InvoiceViewAll;
