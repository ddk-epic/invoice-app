import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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

export const productsSchema = pgTable("products_table", {
  id: serial("id").primaryKey(),
  category: text("name").notNull(),
  description: text("description").notNull(),
  brand: text("brand").notNull(),
  origin: text("origin"),
  weight: text("weight"),
  perBox: integer(),
  quantity: integer().notNull(),
  rate: integer().notNull(),
  amount: integer().notNull(),
});

export const invoiceSchema = pgTable("invoice_table", {
  invoiceId: text("name").notNull(),
  invoiceDate: text("name").notNull(),
  dueDate: text("name").notNull(),

  sender: text("name").notNull(),
  sendTo: text("name").notNull(),
  invoiceTo: text("name").notNull(),

  //items: invoice_product_table
  total: integer().notNull(),
  taxRate: integer().notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertProduct = typeof productsSchema.$inferInsert;
export type SelectProduct = typeof productsSchema.$inferSelect;

export type InsertInvoice = typeof invoiceSchema.$inferInsert;
export type SelectInvoice = typeof invoiceSchema.$inferSelect;
