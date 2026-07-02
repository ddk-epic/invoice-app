import React from "react";

import InvoiceEditor from "@/components/editor/invoice-editor";
import { getContactsAndProducts } from "../actions/server-actions";

async function InvoiceEditorPage() {
  const { privateContact, contactList, productList } =
    await getContactsAndProducts();

  return (
    <main className="top min-h-screen bg-gray-100">
      <InvoiceEditor
        privateContact={privateContact}
        contacts={contactList}
        products={productList}
      />
    </main>
  );
}

export default InvoiceEditorPage;
