import "server-only";

import { db } from "./index";
import { invoiceSchema, productsSchema } from "./schema";
import { eq } from "drizzle-orm";

export const QUERIES = {
  // SELECT
  getAllProducts: async function () {
    return db.select().from(productsSchema);
  },

  getAllInvoices: async function () {
    return db.select().from(invoiceSchema);
  },

  getInvoiceById: async function (id: string) {
    return db
      .select()
      .from(invoiceSchema)
      .where(eq(invoiceSchema.id, parseInt(id)));
  },
};
