import "server-only";

import { and, desc, eq, gte, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "./index";
import {
  contactsSchema as contactsTable,
  invoiceSchema as invoiceTable,
  locationSchema as locationTable,
  profileSchema as profileTable,
  productCatalogSchema as productCatalogTable,
  type SelectContact,
  type SelectInvoice,
  type SelectProductCatalog,
} from "./schema";

import {
  DraftItem,
  InvoiceItem,
  InvoiceRow,
  Invoice,
  LatestInvoice,
  Location,
  Profile,
} from "@/constants/types";
import { BaseContact, Contact } from "@/lib/contacts";
import {
  collectProducts,
  type Product,
  type ProductInput,
} from "@/lib/products";

function rowToContact(row: SelectContact): Contact {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    owner: row.owner ?? undefined,
    address: row.address,
  };
}

// numeric columns are strings in drizzle
function productInputToRow(p: ProductInput) {
  return {
    barcode: p.barcode ?? null,
    category: p.category,
    name: p.name,
    brand: p.brand ?? null,
    origin: p.origin ?? null,
    netContent: String(p.netContent),
    contentUnit: p.contentUnit,
    packSize: p.packSize ?? null,
    price: String(p.price),
  };
}

// jsonb takes objects directly; pre-stringifying double-encodes.
function invoiceDataToRow(inv: Invoice) {
  return {
    invoiceId: inv.invoiceId,
    invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate,
    status: inv.status,
    locationId: inv.locationId ?? null,
    sender: inv.sender,
    sendTo: inv.sendTo,
    invoiceTo: inv.invoiceTo,
    items: inv.items,
    total: inv.total,
    taxRate: inv.taxRate,
  };
}

function rowToInvoice(row: SelectInvoice): Invoice {
  const base = {
    id: row.id,
    invoiceId: row.invoiceId,
    invoiceDate: row.invoiceDate,
    dueDate: row.dueDate,
    locationId: row.locationId,
    sendTo: row.sendTo,
    invoiceTo: row.invoiceTo,
    total: row.total,
    taxRate: row.taxRate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (row.status === "draft") {
    return {
      ...base,
      status: "draft",
      sender: null,
      items: row.items as DraftItem[],
    };
  }
  return {
    ...base,
    status: row.status,
    sender: row.sender as Contact,
    items: row.items as InvoiceItem[],
  };
}

export const QUERIES = {
  // SELECT
  async getPrivateContact(): Promise<Profile[]> {
    return db.select().from(profileTable);
  },

  async getAllContacts(): Promise<Contact[]> {
    const rows = await db.select().from(contactsTable);
    return rows.map(rowToContact);
  },

  async getAllProducts(): Promise<SelectProductCatalog[]> {
    return db.select().from(productCatalogTable);
  },

  async getContactById(id: number): Promise<Contact | undefined> {
    const [row] = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.id, id))
      .limit(1);
    return row ? rowToContact(row) : undefined;
  },

  async getProfile(): Promise<Profile | undefined> {
    const [row] = await db.select().from(profileTable).limit(1);
    return row;
  },

  async getPrimaryLocation(): Promise<Location | undefined> {
    const [row] = await db
      .select()
      .from(locationTable)
      .where(eq(locationTable.isPrimary, true))
      .limit(1);
    return row;
  },

  async getLocationById(id: number): Promise<Location | undefined> {
    const [row] = await db
      .select()
      .from(locationTable)
      .where(eq(locationTable.id, id))
      .limit(1);
    return row;
  },

  async countInvoices(): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoiceTable);
    return row?.count ?? 0;
  },

  async getInvoicesPage(page: number, pageSize: number): Promise<InvoiceRow[]> {
    return db
      .select({
        id: invoiceTable.id,
        invoiceId: invoiceTable.invoiceId,
        status: invoiceTable.status,
        total: invoiceTable.total,
        createdAt: invoiceTable.createdAt,
        client: sql<string>`coalesce(${invoiceTable.sendTo} ->> 'name', '—')`,
      })
      .from(invoiceTable)
      .orderBy(desc(invoiceTable.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  },

  // Window uses the DB clock; buildRecentlyPaid re-filters with the app clock,
  // sub-second drift accepted.
  async getLatestInvoices(): Promise<LatestInvoice[]> {
    return db
      .select({
        id: invoiceTable.id,
        invoiceId: invoiceTable.invoiceId,
        status: invoiceTable.status,
        invoiceDate: invoiceTable.invoiceDate,
        dueDate: invoiceTable.dueDate,
        updatedAt: invoiceTable.updatedAt,
        total: invoiceTable.total,
        client: sql<string>`coalesce(${invoiceTable.sendTo} ->> 'name', '—')`,
      })
      .from(invoiceTable)
      .where(
        or(
          ne(invoiceTable.status, "paid"),
          gte(invoiceTable.updatedAt, sql`now() - interval '7 days'`)
        )
      );
  },

  async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
    const [row] = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.invoiceId, invoiceId))
      .limit(1);
    return row ? rowToInvoice(row) : undefined;
  },

  async getDraftById(id: number): Promise<Invoice | undefined> {
    const [row] = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.id, id));
    return row ? rowToInvoice(row) : undefined;
  },

  async getProductsByIds(ids: number[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const rows = await db
      .select()
      .from(productCatalogTable)
      .where(inArray(productCatalogTable.id, ids));
    return collectProducts(rows).productList;
  },

  async insertDraft(inv: Invoice): Promise<number> {
    const [row] = await db
      .insert(invoiceTable)
      .values(invoiceDataToRow(inv))
      .returning({ id: invoiceTable.id });
    if (!row) throw new Error("insertDraft returned no row");
    return row.id;
  },

  // Draft-shaped writes must never touch a finalized row, whatever the client does.
  async updateDraftById(id: number, inv: Invoice): Promise<boolean> {
    const rows = await db
      .update(invoiceTable)
      .set(invoiceDataToRow(inv))
      .where(and(eq(invoiceTable.id, id), eq(invoiceTable.status, "draft")))
      .returning({ id: invoiceTable.id });
    return rows.length > 0;
  },

  // Assign the next sequential number, freeze the sender, flip to open, atomically.
  // The SET subquery sees the pre-update table, so this still-draft row is excluded.
  // status='draft' guard makes a re-finalize a no-op; then returning is empty.
  async finalizeDraftById(
    id: number,
    sender: Contact,
    items: InvoiceItem[],
    total: number
  ): Promise<string | undefined> {
    const [row] = await db
      .update(invoiceTable)
      .set({
        invoiceId: sql`(SELECT COALESCE(MAX((invoice_id)::int), 0) + 1
                        FROM invoice_invoices WHERE status <> 'draft')`,
        sender,
        items,
        total,
        status: "open",
      })
      .where(and(eq(invoiceTable.id, id), eq(invoiceTable.status, "draft")))
      .returning({ invoiceId: invoiceTable.invoiceId });
    return row?.invoiceId;
  },

  async deleteDraftById(id: number): Promise<void> {
    await db.delete(invoiceTable).where(eq(invoiceTable.id, id));
  },

  // overdue is derived at read time; a late invoice is still stored 'open'.
  async markPaidById(id: number): Promise<void> {
    await db
      .update(invoiceTable)
      .set({ status: "paid" })
      .where(and(eq(invoiceTable.id, id), eq(invoiceTable.status, "open")));
  },

  async insertProduct(p: ProductInput): Promise<void> {
    await db.insert(productCatalogTable).values(productInputToRow(p));
  },

  async updateProduct(id: number, p: ProductInput): Promise<boolean> {
    const res = await db
      .update(productCatalogTable)
      .set(productInputToRow(p))
      .where(eq(productCatalogTable.id, id));
    return res.rowCount > 0;
  },

  async insertContact(newContact: BaseContact): Promise<void> {
    await db.insert(contactsTable).values(newContact);
  },

  async updateContact(id: number, contact: BaseContact): Promise<boolean> {
    const res = await db
      .update(contactsTable)
      .set(contact)
      .where(eq(contactsTable.id, id));
    return res.rowCount > 0;
  },
};
