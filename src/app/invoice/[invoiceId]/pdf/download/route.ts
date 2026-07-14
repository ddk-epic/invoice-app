import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";

import PdfDocument from "@/components/pdf/pdf-document";
import { getInvoiceData, getPrivateData } from "@/app/actions/server-actions";
import { invoiceFileName } from "@/lib/utils";
import { LruCache } from "@/lib/lru-cache";

// Finalized invoices are immutable: cache renders to skip react-pdf on repeat downloads.
const pdfCache = new LruCache<string, Buffer>(32);

export async function GET(
  req: Request,
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

  const etag = `"pdf-${invoiceId}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304 });
  }

  let buffer = pdfCache.get(invoiceId);
  if (!buffer) {
    // PdfDocument renders a <Document>; react-pdf's types don't see through the wrapper.
    const element = React.createElement(PdfDocument, {
      data: invoice,
      privateData,
    }) as React.ReactElement<DocumentProps>;
    buffer = await renderToBuffer(element);
    pdfCache.set(invoiceId, buffer);
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceFileName(invoiceId, invoice.sendTo.name)}"`,
      "Cache-Control": "private, max-age=86400, immutable",
      ETag: etag,
    },
  });
}
