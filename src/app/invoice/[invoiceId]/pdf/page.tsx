import React from "react";
import { notFound } from "next/navigation";
import { QUERIES } from "@/server/db/queries";
import { invoiceJson as invoiceData } from "@/constants/constants";
import { InvoiceData } from "@/constants/types";

interface InvoiceGeneratorProps {
  params: Promise<{ invoiceId: string }>;
}

async function InvoiceGenerator(props: InvoiceGeneratorProps) {
  const { invoiceId } = await props.params;
  //const [invoice] = await QUERIES.getInvoiceById(invoiceId);
  const invoice: InvoiceData = JSON.parse(invoiceData);

  if (!invoice) notFound();

  return (
    <main className="wrapper top">
      <div className="my-8 space-y-4">
        <div>
          <h2>Invoice #{invoice.id}</h2>
          <div>Invoice Date: {invoice.invoiceDate}</div>
          <div>Due Date: {invoice.dueDate}</div>
        </div>
        <div>
          <div>Sender Name: {invoice.sender.name}</div>
          <div>Send To: {invoice.sendTo.name}</div>
          <div>Invoice To: {invoice.invoiceTo.name}</div>
        </div>
        <div>{invoice.items.map((item) => JSON.stringify(item))}</div>
        <div>
          <div>Total: {invoice.total}</div>
          <div>Tax Rate: {invoice.taxRate}%</div>
        </div>
        <div>
          <div>Created At: {new Date(invoice.createdAt).toLocaleString()}</div>
          <div>Updated At: {new Date(invoice.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </main>
  );
}

export default InvoiceGenerator;
