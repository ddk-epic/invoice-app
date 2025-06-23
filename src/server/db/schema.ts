import {
  singlestoreTableCreator,
  bigint,
  varchar,
  int,
  timestamp,
} from "drizzle-orm/singlestore-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 *
 * generate:  npx drizzle-kit generate
 * migrate:   npx drizzle-kit migrate
 * push:      npx drizzle-kit push
 */
export const createTable = singlestoreTableCreator((name) => `invoice_${name}`);

export const productsSchema = createTable("products_table", {
  id: bigint({ mode: "number", unsigned: true }).primaryKey().autoincrement(),
  category: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  brand: varchar({ length: 255 }).notNull(),
  origin: varchar({ length: 255 }),
  weight: varchar({ length: 255 }),
  perBox: int(),
  quantity: int().notNull(),
  rate: int().notNull(),
  amount: int().notNull(),
});

export const invoiceSchema = createTable("invoice_table", {
  invoiceId: varchar({ length: 255 }).notNull(),
  invoiceDate: varchar({ length: 255 }).notNull(),
  dueDate: varchar({ length: 255 }).notNull(),

  sender: varchar({ length: 255 }).notNull(),
  sendTo: varchar({ length: 255 }).notNull(),
  invoiceTo: varchar({ length: 255 }).notNull(),

  //items: invoice_product_table
  total: int().notNull(),
  taxRate: int().notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
