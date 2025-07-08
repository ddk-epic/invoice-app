import React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getStatusColor } from "@/constants/constants";
import { InvoiceData } from "@/constants/types";
import { idPrefix, centsToEuro, deShortDate } from "@/lib/utils";

const InvoiceTable = ({ invoices }: { invoices: InvoiceData[] }) => {
  return (
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
        {invoices.map((invoice) => (
          // @ts-ignore
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">
              {idPrefix(invoice.invoiceId)}
            </TableCell>
            <TableCell>{invoice.sendTo.name}</TableCell>
            <TableCell className="w-16 flex justify-end">
              {centsToEuro(invoice.total)}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() +
                  invoice.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{deShortDate(new Date(invoice.createdAt))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default InvoiceTable;
