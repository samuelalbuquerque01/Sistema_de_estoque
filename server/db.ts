// client/server/db.ts - VERSÃO CORRIGIDA DEFINITIVA PARA RENDER
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// ✅ CORREÇÃO CRÍTICA: Configuração específica para Render
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL não configurada - usando configuração local para desenvolvimento");
}

// Configuração otimizada para Render
const client = postgres(
  databaseUrl || "postgresql://postgres:postgres@localhost:5432/neuropsicocentro",
  {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 10,
    connect_timeout: 10
  }
);

export const db = drizzle(client, { schema });