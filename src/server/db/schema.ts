import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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

export const contactsSchema = pgTable("contacts_table", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  owner: text("owner"),
  address: jsonb("address").notNull(),
});

export const productsSchema = pgTable("products_table", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
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
  id: serial("id").primaryKey(),
  invoiceId: integer().notNull(),
  invoiceDate: text("invoice_date").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull(),

  sender: jsonb("sender").notNull(),
  sendTo: jsonb("send_to").notNull(),
  invoiceTo: jsonb("invoice_to").notNull(),

  items: jsonb().notNull(),
  total: integer().notNull(),
  taxRate: integer().notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertProduct = typeof productsSchema.$inferInsert;
export type SelectProduct = typeof productsSchema.$inferSelect;

export type InsertInvoice = typeof invoiceSchema.$inferInsert;
export type SelectInvoice = typeof invoiceSchema.$inferSelect;
