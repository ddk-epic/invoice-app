"use client";

import React from "react";
import dynamic from "next/dynamic";

// @react-pdf's viewer cannot render during SSR; load it on the client only.
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false }
);

function PdfViewer(props: { document: React.JSX.Element }) {
  const { document: pdfDocument } = props;

  return <PDFViewer className="h-full w-full">{pdfDocument}</PDFViewer>;
}

export default PdfViewer;
