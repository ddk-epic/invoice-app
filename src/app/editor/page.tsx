import React from "react";
import A4InvoiceEditor from "@/components/editor/A4InvoiceEditor";

function InvoiceEditorPage() {
  return (
    <main className="min-h-screen top bg-gray-100 p-8">
      <div className="max-w-4xl mt-4 mx-auto">
        <A4InvoiceEditor />
      </div>
    </main>
  );
}

export default InvoiceEditorPage;
