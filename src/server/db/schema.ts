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

export const privateSchema = pgTable("private_table", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
});

export const contactsSchema = pgTable("contacts_table", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  owner: text("owner"),
  address: jsonb("address").notNull(),
});

export const productsSchema = pgTable("products_table", {
  id: serial("id").primaryKey(),
  // with limited rows (max. 50) the data is saved in json per product category
  categoryName: text("category_name").notNull(),
  categoryJson: jsonb("category_json").notNull(),
});

export const invoiceSchema = pgTable("invoice_table", {
  id: serial("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
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

export type InsertContact = typeof contactsSchema.$inferInsert;
export type SelectContact = typeof contactsSchema.$inferSelect;

export type InsertProduct = typeof productsSchema.$inferInsert;
export type SelectProduct = typeof productsSchema.$inferSelect;

export type InsertInvoice = typeof invoiceSchema.$inferInsert;
export type SelectInvoice = typeof invoiceSchema.$inferSelect;
