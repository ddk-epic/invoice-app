"use server";

import { InvoiceData } from "@/constants/types";
import { InvoiceSchema } from "@/lib/schema";
import { QUERIES } from "@/server/db/queries";

export const insertInvoiceAction = async (invoiceData: InvoiceData) => {
  try {
    const result = InvoiceSchema.safeParse(invoiceData);
    if (!result.success) return console.log(result.error);

    const insertedInvoice = await QUERIES.insertInvoice(invoiceData);
    if (insertedInvoice) console.log("successfully saved to the database!");
  } catch (err) {
    console.error("Server action error:", err);
    throw new Error("Internal Server Error");
  }
};
