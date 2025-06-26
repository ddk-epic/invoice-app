"use client";

import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";

interface PdfViewerProps {
  document: React.JSX.Element;
}

function PdfViewer(props: PdfViewerProps) {
  const { document: pdfDocument } = props;

  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(true), []);

  return (
    <>
      {loaded && (
        <PDFViewer className="w-full h-full">{pdfDocument}</PDFViewer>
      )}
    </>
  );
}

export default PdfViewer;
