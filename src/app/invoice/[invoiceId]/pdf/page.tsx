import React from "react";
import { notFound } from "next/navigation";
import { QUERIES } from "@/server/db/queries";
import { InvoiceData } from "@/constants/types";
import { unstable_cache } from "next/cache";
import PdfViewer from "@/components/pdf-viewer";
import PdfDocument from "@/components/pdf/pdf-document";

interface InvoiceGeneratorProps {
  params: Promise<{ invoiceId: string }>;
}

const getCachedInvoiceData = unstable_cache(
  async (invoiceId: string) => QUERIES.getInvoiceById(invoiceId),
  ["invoiceId"],
  {
    tags: ["invoiceData"],
    revalidate: 60 * 60 * 1, // 1 hour(s)
  }
);

async function InvoiceGenerator(props: InvoiceGeneratorProps) {
  const { invoiceId } = await props.params;
  const invoice = (await getCachedInvoiceData(invoiceId))[0] as InvoiceData;

  //console.log(invoice);

  if (!invoice) notFound();

  const document = <PdfDocument data={invoice} />;

  return (
    <main className="top h-screen">
      <PdfViewer document={document} />
    </main>
  );
}

export default InvoiceGenerator;
