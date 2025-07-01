import React from "react";

import A4InvoiceEditor from "@/components/editor/invoice-editor";
import { QUERIES } from "@/server/db/queries";
import { Contact, InvoiceItem } from "@/constants/types";

async function InvoiceEditorPage() {
  const [contacts, products] = await Promise.all([
    QUERIES.getAllContacts(),
    QUERIES.getAllProducts(),
  ]);
  const contactList = contacts as Contact[];
  const productList = products as unknown as InvoiceItem[];

  return (
    <main className="min-h-screen top bg-gray-100">
      <A4InvoiceEditor contacts={contactList} products={productList} />
    </main>
  );
}

export default InvoiceEditorPage;
