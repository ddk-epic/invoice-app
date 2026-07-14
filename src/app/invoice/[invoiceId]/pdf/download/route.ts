import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";

import PdfDocument from "@/components/pdf/pdf-document";
import { getInvoiceData, getPrivateData } from "@/app/actions/server-actions";
import { invoiceFileName } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const [privateData, invoice] = await Promise.all([
    getPrivateData().then((rows) => rows[0]),
    getInvoiceData(invoiceId),
  ]);

  if (!invoice || invoice.status === "draft") {
    return new Response("Not found", { status: 404 });
  }

  // PdfDocument renders a <Document>; react-pdf's types don't see through the wrapper.
  const element = React.createElement(PdfDocument, {
    data: invoice,
    privateData,
  }) as React.ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceFileName(invoiceId, invoice.sendTo.name)}"`,
    },
  });
}
