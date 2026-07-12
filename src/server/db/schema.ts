import { sql } from "drizzle-orm";
import {
  boolean,
  index,
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
  DraftItem,
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

export const profileSchema = pgTable("invoice_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
});

// One row per business address; exactly one is primary.
export const locationSchema = pgTable("invoice_locations", {
  id: serial("id").primaryKey(),
  label: text("label"),
  address: jsonb("address").$type<Address>().notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const contactsSchema = pgTable("invoice_contacts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  owner: text("owner"),
  address: jsonb("address").$type<Address>().notNull(),
});

// Normalized catalog: one row per product.
// GS1/PAngV-aligned shape; Grundpreis is computed at read time, not stored.
export const productCatalogSchema = pgTable("invoice_products", {
  id: serial("id").primaryKey(),
  barcode: text("barcode"),
  category: text("category").notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  origin: text("origin"),
  netContent: numeric("net_content", { precision: 10, scale: 3 }).notNull(),
  contentUnit: text("content_unit").notNull(),
  packSize: integer("pack_size"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const invoiceSchema = pgTable(
  "invoice_invoices",
  {
    id: serial("id").primaryKey(),
    invoiceId: text("invoice_id").notNull(),
    invoiceDate: text("invoice_date").notNull(),
    dueDate: text("due_date").notNull(),
    status: text("status").$type<InvoiceStatus>().notNull(),
    // Which Location this draft finalizes from; null => primary.
    locationId: integer("location_id"),

    // Frozen at finalize; null while a draft.
    sender: jsonb("sender").$type<Contact>(),
    sendTo: jsonb("send_to").$type<Contact>().notNull(),
    invoiceTo: jsonb("invoice_to").$type<Contact>().notNull(),

    items: jsonb("items").$type<DraftItem[] | InvoiceItem[]>().notNull(),
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
    // Backs the paginated list's ORDER BY created_at DESC top-N scan.
    index("invoice_created_at_idx").on(table.createdAt.desc()),
  ]
);

export type SelectProfile = typeof profileSchema.$inferSelect;
export type SelectLocation = typeof locationSchema.$inferSelect;

export type InsertContact = typeof contactsSchema.$inferInsert;
export type SelectContact = typeof contactsSchema.$inferSelect;

export type InsertProductCatalog = typeof productCatalogSchema.$inferInsert;
export type SelectProductCatalog = typeof productCatalogSchema.$inferSelect;

export type InsertInvoice = typeof invoiceSchema.$inferInsert;
export type SelectInvoice = typeof invoiceSchema.$inferSelect;
