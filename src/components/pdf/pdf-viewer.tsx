"use client";

import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";

function PdfViewer(props: {document: React.JSX.Element;}) {
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
