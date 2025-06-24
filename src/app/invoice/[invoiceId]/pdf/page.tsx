import React from "react";
import { notFound } from "next/navigation";
import { QUERIES } from "@/server/db/queries";
import { InvoiceData } from "@/constants/types";
import { unstable_cache } from "next/cache";

interface InvoiceGeneratorProps {
  params: Promise<{ invoiceId: string }>;
}

const getCachedInvoiceData = unstable_cache(
  async (invoiceId: string) => QUERIES.getInvoiceById(invoiceId),
  ["invoiceId"],
  {
    tags: ["invoiceData"],
    revalidate: 1000 * 60 * 1, // 1 minute(s)
  }
);

async function InvoiceGenerator(props: InvoiceGeneratorProps) {
  const { invoiceId } = await props.params;
  const invoice = (await getCachedInvoiceData(invoiceId))[0] as InvoiceData;

  //console.log(invoice);

  if (!invoice) notFound();

  return (
    <main className="wrapper top">
      <div className="my-8 space-y-4">
        <div>
          <h2>
            Invoice: {invoice.invoiceId}({invoice.id})
          </h2>
          <div>Invoice Date: {invoice.invoiceDate}</div>
          <div>Due Date: {invoice.dueDate}</div>
        </div>
        <div>
          <div>Sender Name: {invoice.sender.name}</div>
          <div>Send To: {invoice.sendTo.name}</div>
          <div>Invoice To: {invoice.invoiceTo.name}</div>
        </div>
        <div>
          Items:
          {invoice.items.map((item) => (
            <div key={item.id}>{item.description}</div>
          ))}
        </div>
        <div>
          <div>Total: {invoice.total / 100}€</div>
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
