// shared/schema.ts - VERSÃO COMPLETA CORRIGIDA
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'produto', 'equipamento', 'insumo', 'ferramenta', 'limpeza'
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  categoryId: varchar("category_id").references(() => categories.id),
  locationId: varchar("location_id").references(() => locations.id),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  description: text("description"),
  type: text("type").notNull(), // 'produto', 'equipamento', 'insumo', 'ferramenta', 'limpeza'
});

export const movements = pgTable("movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  type: text("type").notNull(), // 'entrada', 'saida', 'ajuste'
  quantity: integer("quantity").notNull(),
  userId: varchar("user_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventories = pgTable("inventories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default('em_andamento'), // 'em_andamento', 'finalizado'
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  finishedAt: timestamp("finished_at"),
});

export const inventoryCounts = pgTable("inventory_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryId: varchar("inventory_id").references(() => inventories.id),
  productId: varchar("product_id").references(() => products.id),
  expectedQuantity: integer("expected_quantity").notNull(),
  countedQuantity: integer("counted_quantity").notNull(),
  difference: integer("difference").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🔥 TABELA CORRIGIDA: Relatórios (sem foreign key obrigatória)
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'products', 'low_stock', 'movements', 'inventory', 'financial', 'location'
  format: text("format").notNull(), // 'pdf', 'excel', 'csv'
  filters: json("filters"), // JSON com filtros aplicados
  generatedBy: varchar("generated_by"), // 🔥 REMOVIDA A REFERÊNCIA .references(() => users.id)
  createdAt: timestamp("created_at").defaultNow(),
  filePath: text("file_path"), // Caminho do arquivo gerado
  fileSize: integer("file_size"), // Tamanho do arquivo em bytes
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });

export const insertProductSchema = createInsertSchema(products).omit({ id: true })
  .extend({
    quantity: z.coerce.number().min(0, "Quantidade deve ser maior ou igual a 0"),
    minQuantity: z.coerce.number().min(0, "Quantidade mínima deve ser maior ou igual a 0"),
    unitPrice: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
  });

export const insertMovementSchema = createInsertSchema(movements).omit({ id: true, createdAt: true })
  .extend({
    quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  });

export const insertInventorySchema = createInsertSchema(inventories).omit({ id: true, createdAt: true, finishedAt: true });

export const insertInventoryCountSchema = createInsertSchema(inventoryCounts).omit({ id: true, createdAt: true })
  .extend({
    expectedQuantity: z.coerce.number().min(0),
    countedQuantity: z.coerce.number().min(0),
    difference: z.coerce.number(),
  });

// 🔥 SCHEMA CORRIGIDO: Relatórios
export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, 
  createdAt: true,
  fileSize: true 
}).extend({
  filters: z.any().optional(),
  generatedBy: z.string().optional().nullable(), // 🔥 AGORA É OPCIONAL
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertMovement = z.infer<typeof insertMovementSchema>;
export type Movement = typeof movements.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventories.$inferSelect;
export type InsertInventoryCount = z.infer<typeof insertInventoryCountSchema>;
export type InventoryCount = typeof inventoryCounts.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;