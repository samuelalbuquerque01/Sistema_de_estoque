import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";

const localFallbackUrl = "postgresql://postgres:postgres@localhost:5432/neuropsicocentro";
const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV !== "production" ? localFallbackUrl : undefined);

if (!databaseUrl) {
  throw new Error("DATABASE_URL nao configurada.");
}

const isLocalDatabase = /(localhost|127\.0\.0\.1)/i.test(databaseUrl);
const isSupabasePooler =
  databaseUrl.includes("pooler.supabase.com") || /:6543(?:\/|\?)/.test(databaseUrl);

const client = postgres(databaseUrl, {
  ssl: isLocalDatabase ? false : "require",
  prepare: !isSupabasePooler,
  idle_timeout: process.env.VERCEL ? 5 : 20,
  max_lifetime: 60 * 30,
  max: process.env.VERCEL ? 1 : 10,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
