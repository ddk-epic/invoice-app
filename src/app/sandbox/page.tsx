import React from "react";
import { db } from "@/server/db";
import { invoiceSchema, productsSchema } from "@/server/db/schema";
import { sampleInvoiceData, sampleProducts } from "@/constants/constants";

const newItems = sampleProducts.map(({ id, ...remainder }) => remainder);
const newInvoice = {
  ...sampleInvoiceData,
  sender: JSON.stringify(sampleInvoiceData.sender),
  sendTo: JSON.stringify(sampleInvoiceData.sendTo),
  invoiceTo: JSON.stringify(sampleInvoiceData.invoiceTo),
  items: JSON.stringify(sampleInvoiceData.items),
};

async function insertProducts() {
  return await db.insert(productsSchema).values(newItems);
}

async function insertInvoice() {
  return await db.insert(invoiceSchema).values(newInvoice);
}

function SandboxPage() {
  return (
    <main>
      <div className="wrapper top flex-col py-12 space-y-4">
        <div>
          Seed Function:
          <form
            action={async () => {
              "use server";

              const productsInsert = insertProducts();
              console.log(productsInsert);
            }}
          >
            <button className="px-1 outline rounded-md" type="submit">
              Seed DB
            </button>
          </form>
        </div>
        <div>
          GenerateInvoice
          <form
            action={async () => {
              "use server";

              const invoiceInsert = insertInvoice();
              console.log(invoiceInsert);
            }}
          >
            <button className="px-1 outline rounded-md" type="submit">
              Seed DB
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default SandboxPage;
