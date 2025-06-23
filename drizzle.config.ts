import { type Config } from "drizzle-kit";

export default {
  out: "./drizzle",
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  tablesFilter: ["invoice_*"],
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config;
