// shared/schema.ts - SCHEMA COMPLETO ATUALIZADO
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 🔥 TABELAS PRINCIPAIS
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "limpeza", "ferramenta", "insumo", "equipamento", "outros"
  description: text("description"),
});

export const locations = pgTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  categoryId: text("category_id").references(() => categories.id),
  locationId: text("location_id").references(() => locations.id),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(0),
  unitPrice: text("unit_price"), // Alterado para string para evitar problemas de precisão
  description: text("description"),
  // ❌ REMOVIDO: campo 'type' - agora vem da categoria
});

export const movements = pgTable("movements", {
  id: text("id").primaryKey(),
  productId: text("product_id").references(() => products.id),
  type: text("type").notNull(), // "entrada", "saida", "ajuste"
  quantity: integer("quantity").notNull(),
  userId: text("user_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventories = pgTable("inventories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("em_andamento"), // "em_andamento", "finalizado"
  userId: text("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  finishedAt: timestamp("finished_at"),
});

export const inventoryCounts = pgTable("inventory_counts", {
  id: text("id").primaryKey(),
  inventoryId: text("inventory_id").references(() => inventories.id),
  productId: text("product_id").references(() => products.id),
  countedQuantity: integer("counted_quantity").notNull(),
  difference: integer("difference").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  tipo: text("tipo").notNull().default("individual"), // "individual", "empresa"
  role: text("role").notNull().default("user"), // "super_admin", "admin", "user"
  empresaId: text("empresa_id"),
  emailVerificado: boolean("email_verificado").default(false),
  tokenVerificacao: text("token_verificacao"),
  dataVerificacao: timestamp("data_verificacao"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const empresas = pgTable("empresas", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  email: text("email").notNull(),
  telefone: text("telefone"),
  website: text("website"),
  cep: text("cep"),
  logradouro: text("logradouro"),
  numero: text("numero"),
  complemento: text("complemento"),
  cidade: text("cidade"),
  estado: text("estado"),
  status: text("status").default("pendente"),
  dataAprovacao: timestamp("data_aprovacao"),
  plano: text("plano").default("starter"),
  dataExpiracao: timestamp("data_expiracao"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailVerificacoes = pgTable("email_verificacoes", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  email: text("email").notNull(),
  token: text("token").notNull(),
  tipo: text("tipo").notNull(), // "cadastro", "recuperacao"
  utilizado: boolean("utilizado").default(false),
  expiraEm: timestamp("expira_em").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  format: text("format").notNull(), // "excel", "pdf", "csv"
  filters: jsonb("filters"),
  generatedBy: text("generated_by"),
  filePath: text("file_path"),
  fileSize: integer("file_size").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const importHistory = pgTable("import_history", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  status: text("status").notNull(), // "processando", "processado", "erro"
  productsFound: integer("products_found").default(0),
  productsCreated: integer("products_created").default(0),
  productsUpdated: integer("products_updated").default(0),
  supplier: text("supplier"),
  supplierCnpj: text("supplier_cnpj"),
  supplierAddress: text("supplier_address"),
  nfeNumber: text("nfe_number"),
  nfeKey: text("nfe_key"),
  emissionDate: timestamp("emission_date"),
  totalValue: text("total_value"),
  userId: text("user_id"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nfeData = pgTable("nfe_data", {
  id: text("id").primaryKey(),
  importHistoryId: text("import_history_id").references(() => importHistory.id),
  accessKey: text("access_key").notNull(),
  documentNumber: text("document_number"),
  supplier: jsonb("supplier"),
  emissionDate: timestamp("emission_date").notNull(),
  totalValue: text("total_value"),
  xmlContent: text("xml_content"),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nfeProducts = pgTable("nfe_products", {
  id: text("id").primaryKey(),
  importHistoryId: text("import_history_id").references(() => importHistory.id),
  productId: text("product_id").references(() => products.id),
  nfeCode: text("nfe_code"),
  code: text("code"),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price"),
  unit: text("unit"),
  totalValue: text("total_value"),
  nfeData: jsonb("nfe_data"),
});

// 🔥 SCHEMAS DE INSERÇÃO
export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["limpeza", "ferramenta", "insumo", "equipamento", "outros"]),
}).omit({ id: true });

export const insertLocationSchema = createInsertSchema(locations, {
  name: z.string().min(1, "Nome é obrigatório"),
}).omit({ id: true });

export const insertProductSchema = createInsertSchema(products, {
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  locationId: z.string().min(1, "Localização é obrigatória"),
  quantity: z.number().int().min(0, "Quantidade deve ser maior ou igual a 0"),
  minQuantity: z.number().int().min(0, "Estoque mínimo deve ser maior ou igual a 0"),
  unitPrice: z.string().min(1, "Preço unitário é obrigatório"),
  // ❌ REMOVIDO: type
}).omit({ id: true });

export const insertMovementSchema = createInsertSchema(movements, {
  type: z.enum(["entrada", "saida", "ajuste"]),
  quantity: z.number().int().min(1, "Quantidade deve ser maior que 0"),
}).omit({ id: true, createdAt: true });

export const insertInventorySchema = createInsertSchema(inventories, {
  name: z.string().min(1, "Nome é obrigatório"),
}).omit({ id: true, createdAt: true, status: true, finishedAt: true });

export const insertInventoryCountSchema = createInsertSchema(inventoryCounts, {
  countedQuantity: z.number().int().min(0, "Quantidade contada deve ser maior ou igual a 0"),
}).omit({ id: true, createdAt: true });

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  tipo: z.enum(["individual", "empresa"]),
  role: z.enum(["super_admin", "admin", "user"]),
}).omit({ id: true, createdAt: true, emailVerificado: true, tokenVerificacao: true, dataVerificacao: true });

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true, fileSize: true });

export const insertImportHistorySchema = createInsertSchema(importHistory).omit({ id: true, createdAt: true, processedAt: true });

export const insertNfeDataSchema = createInsertSchema(nfeData).omit({ id: true, createdAt: true });

export const insertNfeProductSchema = createInsertSchema(nfeProducts).omit({ id: true });

export const insertEmpresaSchema = createInsertSchema(empresas).omit({ id: true, createdAt: true, updatedAt: true, status: true, dataAprovacao: true, plano: true, dataExpiracao: true });

export const insertEmailVerificacaoSchema = createInsertSchema(emailVerificacoes).omit({ id: true, createdAt: true, utilizado: true });

// 🔥 SCHEMAS PARA CADASTRO
export const cadastroUsuarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const cadastroEmpresaSchema = z.object({
  empresaNome: z.string().min(1, "Nome da empresa é obrigatório"),
  empresaCnpj: z.string().min(14, "CNPJ inválido"),
  empresaEmail: z.string().email("Email da empresa inválido"),
  empresaTelefone: z.string().min(10, "Telefone inválido"),
  empresaWebsite: z.string().optional(),
  empresaCep: z.string().min(8, "CEP inválido"),
  empresaLogradouro: z.string().min(1, "Logradouro é obrigatório"),
  empresaNumero: z.string().min(1, "Número é obrigatório"),
  empresaComplemento: z.string().optional(),
  empresaCidade: z.string().min(1, "Cidade é obrigatória"),
  empresaEstado: z.string().min(2, "Estado é obrigatório"),
  adminNome: z.string().min(1, "Nome do administrador é obrigatório"),
  adminEmail: z.string().email("Email do administrador inválido"),
  adminSenha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const verificarEmailSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

// 🔥 TIPOS
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Movement = typeof movements.$inferSelect;
export type InsertMovement = z.infer<typeof insertMovementSchema>;
export type Inventory = typeof inventories.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryCount = typeof inventoryCounts.$inferSelect;
export type InsertInventoryCount = z.infer<typeof insertInventoryCountSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type ImportHistory = typeof importHistory.$inferSelect;
export type InsertImportHistory = z.infer<typeof insertImportHistorySchema>;
export type NfeData = typeof nfeData.$inferSelect;
export type InsertNfeData = z.infer<typeof insertNfeDataSchema>;
export type NfeProduct = typeof nfeProducts.$inferSelect;
export type InsertNfeProduct = z.infer<typeof insertNfeProductSchema>;
export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = z.infer<typeof insertEmpresaSchema>;
export type EmailVerificacao = typeof emailVerificacoes.$inferSelect;
export type InsertEmailVerificacao = z.infer<typeof insertEmailVerificacaoSchema>;
export type CadastroUsuario = z.infer<typeof cadastroUsuarioSchema>;
export type CadastroEmpresa = z.infer<typeof cadastroEmpresaSchema>;
export type VerificarEmail = z.infer<typeof verificarEmailSchema>;