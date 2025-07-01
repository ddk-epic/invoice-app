import React from "react";

import { db } from "@/server/db";
import {
  contactsSchema,
  invoiceSchema,
  productsSchema,
} from "@/server/db/schema";
import {
  moreSampleProducts,
  sampleContacts,
  sampleInvoiceData,
} from "@/constants/constants";

const newContacts = sampleContacts.map(({ id, ...rest }) => {
  return { ...rest, address: JSON.stringify(rest.address) };
});

const newItems = moreSampleProducts.map(({ id, ...rest }) => rest);

const { id, ...invoiceData } = sampleInvoiceData;
const newInvoice = {
  ...invoiceData,
  sender: JSON.stringify(invoiceData.sender),
  sendTo: JSON.stringify(invoiceData.sendTo),
  invoiceTo: JSON.stringify(invoiceData.invoiceTo),
  items: JSON.stringify(invoiceData.items),
};

async function insertContacts() {
  return await db.insert(contactsSchema).values(newContacts);
}

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
          Seed Contacts
          <form
            action={async () => {
              "use server";

              const contactsInsert = insertContacts();
              console.log(contactsInsert);
            }}
          >
            <button className="px-1 outline rounded-md" type="submit">
              Seed DB
            </button>
          </form>
        </div>
        <div>
          Seed Products:
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
