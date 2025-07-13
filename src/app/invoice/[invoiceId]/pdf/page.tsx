import React from "react";

import PdfViewer from "@/components/pdf/pdf-viewer";
import PdfDocument from "@/components/pdf/pdf-document";

import {
  getCachedInvoiceData,
  getPrivateData,
} from "@/app/actions/server-actions";

import { notFound } from "next/navigation";
import { InvoiceData, PrivateContact } from "@/constants/types";

interface InvoiceGeneratorProps {
  params: Promise<{ invoiceId: string }>;
}

async function InvoiceGenerator(props: InvoiceGeneratorProps) {
  const { invoiceId } = await props.params;
  const privateData = (await getPrivateData())[0] as PrivateContact;
  const invoice = (await getCachedInvoiceData(invoiceId))[0] as InvoiceData;

  // console.log(invoiceId, invoice);

  if (!invoice) notFound();

  const document = <PdfDocument data={invoice} privateData={privateData} />;

  return (
    <main className="top h-screen">
      <PdfViewer document={document} />
    </main>
  );
}

export default InvoiceGenerator;
