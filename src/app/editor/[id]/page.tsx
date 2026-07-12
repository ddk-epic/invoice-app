import React from "react";
import { notFound } from "next/navigation";

import InvoiceEditor from "@/components/editor/invoice-editor";
import { getContactsAndProducts } from "@/app/actions/server-actions";
import { QUERIES } from "@/server/db/queries";
import { ServerWarnings } from "@/diagnostics/server-warnings";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

async function DraftEditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const draftId = Number(id);
  if (!Number.isInteger(draftId)) notFound();

  const [draft, { privateContact, contactList, productList, droppedProducts }] =
    await Promise.all([
      QUERIES.getDraftById(draftId),
      getContactsAndProducts(),
    ]);
  if (!draft || draft.status !== "draft") notFound();

  return (
    <main className="top min-h-screen bg-gray-100">
      <ServerWarnings droppedProducts={droppedProducts} />
      <InvoiceEditor
        invoiceData={draft}
        privateContact={privateContact}
        contacts={contactList}
        products={productList}
      />
    </main>
  );
}

export default DraftEditorPage;
