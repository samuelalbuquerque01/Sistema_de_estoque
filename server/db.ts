// client/server/db.ts - VERSÃO CORRIGIDA PARA RENDER
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// ✅ CORREÇÃO CRÍTICA: Não valida DATABASE_URL em produção
// ✅ CORREÇÃO: Usa URL padrão se não estiver definida

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== 'production') {
  console.warn("⚠️ DATABASE_URL not set - using default configuration for development");
}

// Usa URL padrão se não estiver definida (para desenvolvimento)
const client = postgres(
  databaseUrl || "postgresql://postgres:postgres@localhost:5432/stockmaster",
  {
    // Configurações para Render/Produção
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    idle_timeout: 20,
    max_lifetime: 60 * 30
  }
);

export const db = drizzle(client, { schema });