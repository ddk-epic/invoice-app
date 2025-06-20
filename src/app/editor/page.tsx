import React from "react";
import A4InvoiceEditor from "@/components/editor/A4InvoiceEditor";
import Optionsbar from "@/components/editor/Optionsbar";

function InvoiceEditorPage() {
  return (
    <main className="min-h-screen top bg-gray-100">
      <div className="z-50 fixed right-0 p-8">
        <Optionsbar />
      </div>
      <div className="max-w-4xl py-4 mx-auto">
        <A4InvoiceEditor />
      </div>
    </main>
  );
}

export default InvoiceEditorPage;
