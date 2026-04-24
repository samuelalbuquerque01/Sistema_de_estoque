import { defineConfig } from "drizzle-kit";

const connectionUrl = process.env.DATABASE_URL_MIGRATION ?? process.env.DATABASE_URL;

if (!connectionUrl) {
  throw new Error("Defina DATABASE_URL ou DATABASE_URL_MIGRATION para usar o Drizzle.");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
});
