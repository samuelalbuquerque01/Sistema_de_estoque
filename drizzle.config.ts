// drizzle.config.ts - VERSÃO CORRIGIDA
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true // ✅ ADICIONE SSL PARA RENDER
  },
});