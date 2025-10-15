// shared/schema.ts - VERSÃO COMPLETA COM PERMISSÕES
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 🔥 TABELAS EXISTENTES (ATUALIZADAS)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  tipo: text("tipo").notNull().default('individual'), // 'individual', 'empresa'
  role: text("role").notNull().default('user'), // 'super_admin', 'admin', 'user'
  empresaId: varchar("empresa_id"),
  emailVerificado: boolean("email_verificado").default(false),
  tokenVerificacao: text("token_verificacao"),
  dataVerificacao: timestamp("data_verificacao"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
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
  type: text("type").notNull(),
});

export const movements = pgTable("movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  userId: varchar("user_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventories = pgTable("inventories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default('em_andamento'),
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

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  format: text("format").notNull(),
  filters: json("filters"),
  generatedBy: varchar("generated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
});

export const importHistory = pgTable("import_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  status: text("status").notNull().default('processando'),
  productsFound: integer("products_found").default(0),
  productsCreated: integer("products_created").default(0),
  productsUpdated: integer("products_updated").default(0),
  supplier: text("supplier"),
  supplierCnpj: text("supplier_cnpj"),
  supplierAddress: text("supplier_address"),
  nfeNumber: text("nfe_number"),
  nfeKey: text("nfe_key"),
  emissionDate: timestamp("emission_date"),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).default('0'),
  userId: varchar("user_id").references(() => users.id),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const nfeProducts = pgTable("nfe_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  importHistoryId: varchar("import_history_id").references(() => importHistory.id),
  productId: varchar("product_id").references(() => products.id),
  nfeCode: text("nfe_code").notNull(),
  code: text("code"),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  unit: text("unit"),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }),
  nfeData: json("nfe_data"),
});

export const nfeData = pgTable("nfe_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  importHistoryId: varchar("import_history_id").references(() => importHistory.id),
  accessKey: text("access_key").notNull().unique(),
  documentNumber: text("document_number").notNull(),
  supplier: json("supplier").notNull(),
  emissionDate: timestamp("emission_date").notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  xmlContent: text("xml_content"),
  rawData: json("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🔥 NOVAS TABELAS PARA SISTEMA DE CADASTRO
export const empresas = pgTable("empresas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  email: text("email").notNull().unique(),
  telefone: text("telefone").notNull(),
  website: text("website"),
  
  // Endereço
  cep: text("cep").notNull(),
  logradouro: text("logradouro").notNull(),
  numero: text("numero").notNull(),
  complemento: text("complemento"),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  
  // Status
  status: text("status").notNull().default('pendente'),
  dataAprovacao: timestamp("data_aprovacao"),
  
  // Plano
  plano: text("plano").notNull().default('starter'),
  dataExpiracao: timestamp("data_expiracao"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailVerificacoes = pgTable("email_verificacoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  tipo: text("tipo").notNull(),
  expiraEm: timestamp("expira_em").notNull(),
  utilizado: boolean("utilizado").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🔥 SCHEMAS DE VALIDAÇÃO ZOD
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  emailVerificado: true,
  tokenVerificacao: true,
  dataVerificacao: true 
}).extend({
  tipo: z.enum(['individual', 'empresa']).optional(),
  role: z.enum(['super_admin', 'admin', 'user']).optional(),
  empresaId: z.string().optional().nullable(),
});

export const insertEmpresaSchema = createInsertSchema(empresas).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  dataAprovacao: true,
  plano: true,
  dataExpiracao: true 
}).extend({
  cnpj: z.string().min(14, "CNPJ deve ter 14 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  cep: z.string().min(8, "CEP inválido"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
});

export const insertEmailVerificacaoSchema = createInsertSchema(emailVerificacoes).omit({ 
  id: true,
  createdAt: true 
});

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
export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, 
  createdAt: true,
  fileSize: true 
}).extend({
  filters: z.any().optional(),
  generatedBy: z.string().optional().nullable(),
});
export const insertImportHistorySchema = createInsertSchema(importHistory).omit({ 
  id: true, 
  createdAt: true,
  processedAt: true 
}).extend({
  productsFound: z.coerce.number().min(0).optional(),
  productsCreated: z.coerce.number().min(0).optional(),
  productsUpdated: z.coerce.number().min(0).optional(),
  supplierCnpj: z.string().optional(),
  supplierAddress: z.string().optional(),
  emissionDate: z.coerce.date().optional(),
  totalValue: z.coerce.number().min(0).optional(),
  nfeKey: z.string().length(44, "Chave de acesso deve ter 44 caracteres").optional(),
});
export const insertNfeProductSchema = createInsertSchema(nfeProducts).omit({ id: true })
  .extend({
    quantity: z.coerce.number().min(0),
    unitPrice: z.coerce.number().min(0).optional(),
    totalValue: z.coerce.number().min(0).optional(),
    code: z.string().optional(),
  });
export const insertNfeDataSchema = createInsertSchema(nfeData).omit({ id: true, createdAt: true })
  .extend({
    accessKey: z.string().length(44, "Chave de acesso deve ter 44 caracteres"),
    totalValue: z.coerce.number().min(0),
    emissionDate: z.coerce.date(),
    xmlContent: z.string().optional(),
    rawData: z.any().optional(),
  });

// 🔥 SCHEMAS ESPECÍFICOS PARA CADASTRO
export const cadastroUsuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
  aceitarTermos: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
  receberNewsletter: z.boolean().default(false),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não conferem",
  path: ["confirmarSenha"],
});

export const cadastroEmpresaSchema = z.object({
  empresaNome: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres"),
  empresaCnpj: z.string().min(14, "CNPJ deve ter 14 caracteres").max(18),
  empresaEmail: z.string().email("Email da empresa inválido"),
  empresaTelefone: z.string().min(10, "Telefone inválido"),
  empresaWebsite: z.string().optional(),
  empresaCep: z.string().min(8, "CEP inválido"),
  empresaLogradouro: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  empresaNumero: z.string().min(1, "Número é obrigatório"),
  empresaComplemento: z.string().optional(),
  empresaCidade: z.string().min(2, "Cidade é obrigatória"),
  empresaEstado: z.string().length(2, "Estado deve ter 2 caracteres"),
  adminNome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  adminEmail: z.string().email("Email inválido"),
  adminTelefone: z.string().min(10, "Telefone inválido"),
  adminSenha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  adminConfirmarSenha: z.string(),
  aceitarTermos: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
}).refine((data) => data.adminSenha === data.adminConfirmarSenha, {
  message: "Senhas não conferem",
  path: ["adminConfirmarSenha"],
});

export const verificarEmailSchema = z.object({
  token: z.string().min(10, "Token inválido"),
});

// 🔥 TIPOS
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEmpresa = z.infer<typeof insertEmpresaSchema>;
export type Empresa = typeof empresas.$inferSelect;
export type InsertEmailVerificacao = z.infer<typeof insertEmailVerificacaoSchema>;
export type EmailVerificacao = typeof emailVerificacoes.$inferSelect;
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
export type InsertImportHistory = z.infer<typeof insertImportHistorySchema>;
export type ImportHistory = typeof importHistory.$inferSelect;
export type InsertNfeProduct = z.infer<typeof insertNfeProductSchema>;
export type NfeProduct = typeof nfeProducts.$inferSelect;
export type InsertNfeData = z.infer<typeof insertNfeDataSchema>;
export type NfeData = typeof nfeData.$inferSelect;
export type CadastroUsuario = z.infer<typeof cadastroUsuarioSchema>;
export type CadastroEmpresa = z.infer<typeof cadastroEmpresaSchema>;
export type VerificarEmail = z.infer<typeof verificarEmailSchema>;