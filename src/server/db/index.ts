import { drizzle } from "drizzle-orm/singlestore";
import { createPool, type Pool } from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { connection: Pool | undefined };

const connection =
  globalForDb.connection ??
  createPool({
    host: process.env.SINGLESTORE_HOST,
    port: parseInt(process.env.SINGLESTORE_PORT!),
    user: process.env.SINGLESTORE_USER,
    password: process.env.SINGLESTORE_PASS,
    database: process.env.SINGLESTORE_DB,
    ssl: {},
    maxIdle: 0,
  });

if (process.env.NODE_ENV !== "production") globalForDb.connection = connection;

connection.addListener("error", (err) => {
  console.error("Database connection error:", err);
});

export const db = drizzle(connection, { schema });
