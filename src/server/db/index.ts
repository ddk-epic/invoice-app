import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const postgres_url = process.env.POSTGRES_URL;
if (!postgres_url) {
  throw new Error("POSTGRES_URL is not set");
}

const sql = neon(postgres_url);
export const db = drizzle({ client: sql });
