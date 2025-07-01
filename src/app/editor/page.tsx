import React from "react";

import A4InvoiceEditor from "@/components/editor/invoice-editor";
import { getContactsAndProducts } from "@/server/db/queries";

async function InvoiceEditorPage() {
  const { contactList, productList } = await getContactsAndProducts();

  return (
    <main className="min-h-screen top bg-gray-100">
      <A4InvoiceEditor contacts={contactList} products={productList} />
    </main>
  );
}

export default InvoiceEditorPage;
