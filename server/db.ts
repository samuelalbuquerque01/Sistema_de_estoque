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

console.log('🗄️ Database URL configured (host:', databaseUrl.split('@')[1]?.split(':')[0] || 'unknown', ')');

const isLocalDatabase = /(localhost|127\.0\.0\.1)/i.test(databaseUrl);
const isSupabasePooler =
  databaseUrl.includes("pooler.supabase.com") || /:6543(?:\/|\?)/.test(databaseUrl);

console.log('🌐 Connection mode:', isSupabasePooler ? 'Supabase Pooler' : (isLocalDatabase ? 'Local' : 'Remote'));

let client;
try {
  client = postgres(databaseUrl, {
    ssl: isLocalDatabase ? false : "require",
    prepare: !isSupabasePooler,
    idle_timeout: process.env.VERCEL ? 5 : 20,
    max_lifetime: 60 * 30,
    max: process.env.VERCEL ? 1 : 10,
    connect_timeout: 10,
  });
  console.log('✅ Database client created successfully');
} catch (error) {
  console.error('❌ Error creating database client:', error);
  throw error;
}

export const db = drizzle(client, { schema });
console.log('✅ Drizzle ORM initialized');
