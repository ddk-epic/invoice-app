import React from "react";
import A4InvoiceEditor from "@/components/editor/invoice-editor";
import Optionsbar from "@/components/editor/optionsbar";

function InvoiceEditorPage() {
  return (
    <main className="min-h-screen top bg-gray-100">
      <A4InvoiceEditor />
    </main>
  );
}

export default InvoiceEditorPage;
