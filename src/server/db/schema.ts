import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type {
  Address,
  Contact,
  InvoiceItem,
  InvoiceStatus,
} from "@/constants/types";

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
  address: jsonb("address").$type<Address>().notNull(),
});

export const productsSchema = pgTable("products_table", {
  id: serial("id").primaryKey(),
  // with limited rows (max. 50) the data is saved in json per product category
  categoryName: text("category_name").notNull(),
  categoryJson: jsonb("category_json").notNull(),
});

// Normalized catalog: one row per product (replaces the productsSchema JSON blob).
// GS1/PAngV-aligned shape; Grundpreis is computed at read time, not stored.
export const productCatalogSchema = pgTable("products", {
  id: serial("id").primaryKey(),
  gtin: text("gtin"),
  category: text("category").notNull(),
  description: text("description").notNull(),
  brand: text("brand"),
  origin: text("origin"),
  netContent: numeric("net_content", { precision: 10, scale: 3 }).notNull(),
  contentUnit: text("content_unit").notNull(),
  packSize: integer("pack_size"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const invoiceSchema = pgTable(
  "invoice_table",
  {
    id: serial("id").primaryKey(),
    invoiceId: text("invoice_id").notNull(),
    invoiceDate: text("invoice_date").notNull(),
    dueDate: text("due_date").notNull(),
    status: text("status").$type<InvoiceStatus>().notNull(),

    sender: jsonb("sender").$type<Contact>().notNull(),
    sendTo: jsonb("send_to").$type<Contact>().notNull(),
    invoiceTo: jsonb("invoice_to").$type<Contact>().notNull(),

    items: jsonb("items").$type<InvoiceItem[]>().notNull(),
    total: integer("total").notNull(),
    taxRate: integer("tax_rate").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  // Issued invoices must have unique numbers; drafts share a blank number.
  (table) => [
    uniqueIndex("invoice_issued_number_uniq")
      .on(table.invoiceId)
      .where(sql`status <> 'draft'`),
  ]
);

export type InsertContact = typeof contactsSchema.$inferInsert;
export type SelectContact = typeof contactsSchema.$inferSelect;

export type InsertProduct = typeof productsSchema.$inferInsert;
export type SelectProduct = typeof productsSchema.$inferSelect;

export type InsertProductCatalog = typeof productCatalogSchema.$inferInsert;
export type SelectProductCatalog = typeof productCatalogSchema.$inferSelect;

export type InsertInvoice = typeof invoiceSchema.$inferInsert;
export type SelectInvoice = typeof invoiceSchema.$inferSelect;
