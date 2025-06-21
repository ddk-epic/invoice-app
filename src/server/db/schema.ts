import {
  text,
  singlestoreTableCreator,
  bigint,
  singlestoreTable,
  varchar,
  int,
  decimal,
} from "drizzle-orm/singlestore-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 *
 * generate cmd: npx drizzle-kit generate
 */
export const createTable = singlestoreTableCreator((name) => `invoice_${name}`);

export const products = createTable("products_table", {
  id: bigint({ mode: "number", unsigned: true }).primaryKey().autoincrement(),
  category: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  brand: varchar({ length: 255 }).notNull(),
  origin: varchar({ length: 255 }),
  weight: varchar({ length: 255 }),
  perBox: int(),
  quantity: int().notNull(),
  rate: decimal({ precision: 10, scale: 2 }).notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
});
