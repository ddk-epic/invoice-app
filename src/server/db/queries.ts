import "server-only";

import { db } from "./index";
import { invoiceSchema, productsSchema } from "./schema";
import { eq } from "drizzle-orm";

export const QUERIES = {
  getAllProducts: async function () {
    return db.select().from(productsSchema);
  },
  getInvoice: async function (invoiceId: string) {
    return db
      .select()
      .from(invoiceSchema)
      .where(eq(invoiceSchema.invoiceId, invoiceId));
  },
};
