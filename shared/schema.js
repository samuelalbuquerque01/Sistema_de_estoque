"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarEmailSchema = exports.cadastroEmpresaSchema = exports.cadastroUsuarioSchema = exports.insertEmailVerificacaoSchema = exports.insertEmpresaSchema = exports.insertNfeProductSchema = exports.insertNfeDataSchema = exports.insertImportHistorySchema = exports.insertReportSchema = exports.insertUserSchema = exports.insertInventoryCountSchema = exports.insertInventorySchema = exports.insertMovementSchema = exports.insertProductSchema = exports.insertLocationSchema = exports.insertCategorySchema = exports.nfeProducts = exports.nfeData = exports.importHistory = exports.reports = exports.emailVerificacoes = exports.empresas = exports.users = exports.inventoryCounts = exports.inventories = exports.movements = exports.products = exports.locations = exports.categories = void 0;
// shared/schema.ts - SCHEMA COMPLETO CORRIGIDO
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
// 🔥 TABELAS PRINCIPAIS - CORRIGIDAS
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    type: (0, pg_core_1.text)("type").notNull(),
    description: (0, pg_core_1.text)("description"),
});
exports.locations = (0, pg_core_1.pgTable)("locations", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
});
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    code: (0, pg_core_1.text)("code").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    categoryId: (0, pg_core_1.text)("category_id").references(function () { return exports.categories.id; }),
    locationId: (0, pg_core_1.text)("location_id").references(function () { return exports.locations.id; }),
    quantity: (0, pg_core_1.integer)("quantity").notNull().default(0),
    minQuantity: (0, pg_core_1.integer)("min_quantity").notNull().default(0),
    unitPrice: (0, pg_core_1.text)("unit_price"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.movements = (0, pg_core_1.pgTable)("movements", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    productId: (0, pg_core_1.text)("product_id").references(function () { return exports.products.id; }),
    type: (0, pg_core_1.text)("type").notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    userId: (0, pg_core_1.text)("user_id"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.inventories = (0, pg_core_1.pgTable)("inventories", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("em_andamento"),
    userId: (0, pg_core_1.text)("user_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    finishedAt: (0, pg_core_1.timestamp)("finished_at"),
});
exports.inventoryCounts = (0, pg_core_1.pgTable)("inventory_counts", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    inventoryId: (0, pg_core_1.text)("inventory_id").references(function () { return exports.inventories.id; }),
    productId: (0, pg_core_1.text)("product_id").references(function () { return exports.products.id; }),
    countedQuantity: (0, pg_core_1.integer)("counted_quantity").notNull(),
    difference: (0, pg_core_1.integer)("difference").notNull().default(0),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    tipo: (0, pg_core_1.text)("tipo").notNull().default("individual"),
    role: (0, pg_core_1.text)("role").notNull().default("user"),
    empresaId: (0, pg_core_1.text)("empresa_id"),
    emailVerificado: (0, pg_core_1.boolean)("email_verificado").default(false),
    tokenVerificacao: (0, pg_core_1.text)("token_verificacao"),
    dataVerificacao: (0, pg_core_1.timestamp)("data_verificacao"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.empresas = (0, pg_core_1.pgTable)("empresas", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    nome: (0, pg_core_1.text)("nome").notNull(),
    cnpj: (0, pg_core_1.text)("cnpj").notNull().unique(),
    email: (0, pg_core_1.text)("email").notNull(),
    telefone: (0, pg_core_1.text)("telefone"),
    website: (0, pg_core_1.text)("website"),
    cep: (0, pg_core_1.text)("cep"),
    logradouro: (0, pg_core_1.text)("logradouro"),
    numero: (0, pg_core_1.text)("numero"),
    complemento: (0, pg_core_1.text)("complemento"),
    cidade: (0, pg_core_1.text)("cidade"),
    estado: (0, pg_core_1.text)("estado"),
    status: (0, pg_core_1.text)("status").default("pendente"),
    dataAprovacao: (0, pg_core_1.timestamp)("data_aprovacao"),
    plano: (0, pg_core_1.text)("plano").default("starter"),
    dataExpiracao: (0, pg_core_1.timestamp)("data_expiracao"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.emailVerificacoes = (0, pg_core_1.pgTable)("email_verificacoes", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").references(function () { return exports.users.id; }),
    email: (0, pg_core_1.text)("email").notNull(),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    tipo: (0, pg_core_1.text)("tipo").notNull(),
    utilizado: (0, pg_core_1.boolean)("utilizado").default(false),
    expiraEm: (0, pg_core_1.timestamp)("expira_em").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.reports = (0, pg_core_1.pgTable)("reports", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    type: (0, pg_core_1.text)("type").notNull(),
    format: (0, pg_core_1.text)("format").notNull(),
    filters: (0, pg_core_1.jsonb)("filters").default({}),
    generatedBy: (0, pg_core_1.text)("generated_by"),
    filePath: (0, pg_core_1.text)("file_path"),
    fileSize: (0, pg_core_1.integer)("file_size").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.importHistory = (0, pg_core_1.pgTable)("import_history", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    fileName: (0, pg_core_1.text)("file_name").notNull(),
    status: (0, pg_core_1.text)("status").notNull(),
    productsFound: (0, pg_core_1.integer)("products_found").default(0),
    productsCreated: (0, pg_core_1.integer)("products_created").default(0),
    productsUpdated: (0, pg_core_1.integer)("products_updated").default(0),
    supplier: (0, pg_core_1.text)("supplier"),
    supplierCnpj: (0, pg_core_1.text)("supplier_cnpj"),
    supplierAddress: (0, pg_core_1.text)("supplier_address"),
    nfeNumber: (0, pg_core_1.text)("nfe_number"),
    nfeKey: (0, pg_core_1.text)("nfe_key"),
    emissionDate: (0, pg_core_1.timestamp)("emission_date"),
    totalValue: (0, pg_core_1.text)("total_value"),
    userId: (0, pg_core_1.text)("user_id"),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.nfeData = (0, pg_core_1.pgTable)("nfe_data", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    importHistoryId: (0, pg_core_1.text)("import_history_id").references(function () { return exports.importHistory.id; }).notNull(),
    accessKey: (0, pg_core_1.text)("access_key").notNull().unique(),
    documentNumber: (0, pg_core_1.text)("document_number"),
    supplier: (0, pg_core_1.jsonb)("supplier").default({}),
    emissionDate: (0, pg_core_1.timestamp)("emission_date").notNull(),
    totalValue: (0, pg_core_1.text)("total_value"),
    xmlContent: (0, pg_core_1.text)("xml_content"),
    rawData: (0, pg_core_1.jsonb)("raw_data").default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.nfeProducts = (0, pg_core_1.pgTable)("nfe_products", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    importHistoryId: (0, pg_core_1.text)("import_history_id").references(function () { return exports.importHistory.id; }).notNull(),
    productId: (0, pg_core_1.text)("product_id").references(function () { return exports.products.id; }),
    nfeCode: (0, pg_core_1.text)("nfe_code"),
    code: (0, pg_core_1.text)("code"),
    name: (0, pg_core_1.text)("name").notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    unitPrice: (0, pg_core_1.text)("unit_price"),
    unit: (0, pg_core_1.text)("unit"),
    totalValue: (0, pg_core_1.text)("total_value"),
    nfeData: (0, pg_core_1.jsonb)("nfe_data").default({}),
});
// 🔥 SCHEMAS DE INSERÇÃO - CORRIGIDOS
exports.insertCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.categories, {
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    type: zod_1.z.string().min(1, "Tipo é obrigatório"),
}).omit({ id: true });
exports.insertLocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.locations, {
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
}).omit({ id: true });
exports.insertProductSchema = (0, drizzle_zod_1.createInsertSchema)(exports.products, {
    code: zod_1.z.string().min(1, "Código é obrigatório"),
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    categoryId: zod_1.z.string().min(1, "Categoria é obrigatória"),
    locationId: zod_1.z.string().min(1, "Localização é obrigatória"),
    quantity: zod_1.z.number().int().min(0, "Quantidade deve ser maior ou igual a 0"),
    minQuantity: zod_1.z.number().int().min(0, "Estoque mínimo deve ser maior ou igual a 0"),
    unitPrice: zod_1.z.string().min(1, "Preço unitário é obrigatório"),
}).omit({ id: true, createdAt: true });
exports.insertMovementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.movements, {
    type: zod_1.z.enum(["entrada", "saida", "ajuste"]),
    quantity: zod_1.z.number().int().min(1, "Quantidade deve ser maior que 0"),
}).omit({ id: true, createdAt: true });
exports.insertInventorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventories, {
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
}).omit({ id: true, createdAt: true, status: true, finishedAt: true });
exports.insertInventoryCountSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryCounts, {
    countedQuantity: zod_1.z.number().int().min(0, "Quantidade contada deve ser maior ou igual a 0"),
}).omit({ id: true, createdAt: true });
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users, {
    username: zod_1.z.string().min(1, "Username é obrigatório"),
    password: zod_1.z.string().min(1, "Senha é obrigatória"),
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    email: zod_1.z.string().email("Email inválido"),
    tipo: zod_1.z.enum(["individual", "empresa"]),
    role: zod_1.z.enum(["super_admin", "admin", "user"]),
}).omit({
    id: true,
    createdAt: true,
    emailVerificado: true,
    tokenVerificacao: true,
    dataVerificacao: true
});
exports.insertReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reports, {
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    type: zod_1.z.string().min(1, "Tipo é obrigatório"),
    format: zod_1.z.string().min(1, "Formato é obrigatório"),
}).omit({ id: true, createdAt: true, fileSize: true });
exports.insertImportHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.importHistory, {
    fileName: zod_1.z.string().min(1, "Nome do arquivo é obrigatório"),
    status: zod_1.z.string().min(1, "Status é obrigatório"),
}).omit({ id: true, createdAt: true });
exports.insertNfeDataSchema = (0, drizzle_zod_1.createInsertSchema)(exports.nfeData, {
    accessKey: zod_1.z.string().min(1, "Chave de acesso é obrigatória"),
    emissionDate: zod_1.z.date(),
}).omit({ id: true, createdAt: true });
exports.insertNfeProductSchema = (0, drizzle_zod_1.createInsertSchema)(exports.nfeProducts, {
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    quantity: zod_1.z.number().int().min(1, "Quantidade deve ser maior que 0"),
}).omit({ id: true });
exports.insertEmpresaSchema = (0, drizzle_zod_1.createInsertSchema)(exports.empresas, {
    nome: zod_1.z.string().min(1, "Nome é obrigatório"),
    cnpj: zod_1.z.string().min(14, "CNPJ é obrigatório"),
    email: zod_1.z.string().email("Email inválido"),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
    dataAprovacao: true,
    plano: true,
    dataExpiracao: true
});
exports.insertEmailVerificacaoSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailVerificacoes, {
    email: zod_1.z.string().email("Email inválido"),
    token: zod_1.z.string().min(1, "Token é obrigatório"),
    tipo: zod_1.z.string().min(1, "Tipo é obrigatório"),
    expiraEm: zod_1.z.date(),
}).omit({ id: true, createdAt: true, utilizado: true });
// 🔥 SCHEMAS PARA CADASTRO
exports.cadastroUsuarioSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, "Nome é obrigatório"),
    email: zod_1.z.string().email("Email inválido"),
    senha: zod_1.z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
exports.cadastroEmpresaSchema = zod_1.z.object({
    empresaNome: zod_1.z.string().min(1, "Nome da empresa é obrigatório"),
    empresaCnpj: zod_1.z.string().min(14, "CNPJ inválido"),
    empresaEmail: zod_1.z.string().email("Email da empresa inválido"),
    empresaTelefone: zod_1.z.string().min(10, "Telefone inválido"),
    empresaWebsite: zod_1.z.string().optional(),
    empresaCep: zod_1.z.string().min(8, "CEP inválido"),
    empresaLogradouro: zod_1.z.string().min(1, "Logradouro é obrigatório"),
    empresaNumero: zod_1.z.string().min(1, "Número é obrigatório"),
    empresaComplemento: zod_1.z.string().optional(),
    empresaCidade: zod_1.z.string().min(1, "Cidade é obrigatória"),
    empresaEstado: zod_1.z.string().min(2, "Estado é obrigatório"),
    adminNome: zod_1.z.string().min(1, "Nome do administrador é obrigatório"),
    adminEmail: zod_1.z.string().email("Email do administrador inválido"),
    adminSenha: zod_1.z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
exports.verificarEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token é obrigatório"),
});
