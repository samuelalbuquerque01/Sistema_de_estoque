// server/storage.ts - VERSÃO SIMPLIFICADA PARA DEPLOY
import { 
  type User, type InsertUser, type Product, type InsertProduct, 
  type Category, type InsertCategory, type Location, type InsertLocation, 
  type Movement, type InsertMovement, type Inventory, type InsertInventory, 
  type InventoryCount, type InsertInventoryCount, type Report, type InsertReport,
  type ImportHistory, type InsertImportHistory, type NfeProduct, type InsertNfeProduct,
  type NfeData, type InsertNfeData,
  type Empresa, type InsertEmpresa, type EmailVerificacao, type InsertEmailVerificacao,
  type CadastroUsuario, type CadastroEmpresa
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { 
  users, products, categories, locations, movements, inventories, 
  inventoryCounts, reports, importHistory, nfeProducts, nfeData,
  empresas, emailVerificacoes
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  getLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;
  getMovements(): Promise<Movement[]>;
  createMovement(movement: InsertMovement): Promise<Movement>;
  getMovementsByProduct(productId: string): Promise<Movement[]>;
  getInventories(): Promise<Inventory[]>;
  getInventory(id: string): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: string, inventory: Partial<InsertInventory>): Promise<Inventory>;
  finalizeInventory(id: string): Promise<Inventory>;
  reopenInventory(id: string): Promise<Inventory>;
  getInventoryCounts(inventoryId: string): Promise<InventoryCount[]>;
  createInventoryCount(count: InsertInventoryCount): Promise<InventoryCount>;

  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  deleteReport(id: string): Promise<void>;
  
  getProductsReport(): Promise<any>;
  getLowStockProducts(): Promise<any>;
  getFinancialReport(): Promise<any>;
  getMovementsReport(startDate?: Date, endDate?: Date): Promise<any>;
  getInventoryReport(): Promise<any>;
  getProductsByLocationReport(): Promise<any>;

  createImportHistory(importData: InsertImportHistory): Promise<ImportHistory>;
  getImportHistory(): Promise<ImportHistory[]>;
  getImportHistoryById(id: string): Promise<ImportHistory | undefined>;
  updateImportHistory(id: string, importData: Partial<InsertImportHistory>): Promise<ImportHistory>;
  deleteImportHistory(id: string): Promise<void>;
  
  createNfeProduct(nfeProduct: InsertNfeProduct): Promise<NfeProduct>;
  getNfeProductsByImport(importHistoryId: string): Promise<NfeProduct[]>;
  
  createNfeData(nfeData: InsertNfeData): Promise<NfeData>;
  getNfeDataByImport(importHistoryId: string): Promise<NfeData | undefined>;
  getNfeDataByAccessKey(accessKey: string): Promise<NfeData | undefined>;
  
  processNfeImport(fileData: any, userId?: string): Promise<ImportHistory>;

  createEmpresa(empresa: InsertEmpresa): Promise<Empresa>;
  getEmpresa(id: string): Promise<Empresa | undefined>;
  getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined>;
  getEmpresaByEmail(email: string): Promise<Empresa | undefined>;
  updateEmpresa(id: string, empresa: Partial<InsertEmpresa>): Promise<Empresa>;
  
  createEmailVerificacao(verificacao: InsertEmailVerificacao): Promise<EmailVerificacao>;
  getEmailVerificacao(token: string): Promise<EmailVerificacao | undefined>;
  marcarEmailComoVerificado(userId: string): Promise<User>;
  utilizarTokenVerificacao(token: string): Promise<EmailVerificacao>;
  
  cadastrarUsuarioIndividual(dados: CadastroUsuario): Promise<{user: User, token: string}>;
  cadastrarEmpresa(dados: CadastroEmpresa): Promise<{empresa: Empresa, admin: User, token: string}>;

  getUsersByEmpresa(empresaId: string): Promise<User[]>;
  createUserForEmpresa(userData: any, empresaId: string, createdBy: string): Promise<User>;
  updateUserRole(userId: string, role: 'super_admin' | 'admin' | 'user'): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  canUserAccessModule(userId: string, module: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<any>;
  getEmpresaUsers(empresaId: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async ensureDefaultCategories(): Promise<void> {
    try {
      const existingCategories = await this.getCategories();
      
      if (existingCategories.length === 0) {
        console.log('Criando categorias padrão...');
        const defaultCategories = [
          {
            id: 'limpeza',
            name: 'Produtos de Limpeza',
            type: 'limpeza',
            description: 'Produtos para limpeza e higienização'
          },
          {
            id: 'ferramenta', 
            name: 'Ferramentas',
            type: 'ferramenta',
            description: 'Ferramentas manuais e elétricas'
          },
          {
            id: 'insumo',
            name: 'Insumos', 
            type: 'insumo',
            description: 'Matérias-primas e insumos para produção'
          },
          {
            id: 'equipamento',
            name: 'Equipamentos',
            type: 'equipamento', 
            description: 'Máquinas e equipamentos'
          },
          {
            id: 'material',
            name: 'Materiais',
            type: 'material',
            description: 'Materiais diversos'
          },
          {
            id: 'outros',
            name: 'Outros',
            type: 'outros',
            description: 'Outros tipos de produtos'
          }
        ];

        for (const category of defaultCategories) {
          await db.insert(categories).values(category);
        }
        
        console.log('Categorias padrão criadas com sucesso');
      } else {
        console.log('Categorias já existem:', existingCategories.length);
      }
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
    }
  }

  async ensureDefaultUser(): Promise<string> {
    try {
      // Criar categorias primeiro
      await this.ensureDefaultCategories();
      
      const existingUser = await this.getUserByEmail('admin@neuropsicocentro.com');
      if (existingUser) {
        console.log('Usuário admin já existe:', existingUser.id);
        return existingUser.id;
      }
      
      console.log('Criando usuário admin padrão...');
      const defaultUser: InsertUser = {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        email: 'admin@neuropsicocentro.com',
        tipo: 'individual',
        role: 'super_admin',
        emailVerificado: true
      };
      const user = await this.createUser(defaultUser);
      console.log('Usuário admin criado com sucesso:', user.id);
      return user.id;
    } catch (error) {
      console.error('Erro ao criar usuário padrão:', error);
      // Retorna um ID fake para permitir que o app continue
      return 'default-admin-id';
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const result = await db.select().from(users).orderBy(users.name);
      return result;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0];
    } catch (error) {
      try {
        const result = await db.select().from(users).where(eq(users.username, email));
        return result[0];
      } catch (fallbackError) {
        console.error('Erro ao buscar usuário por email:', error);
        return undefined;
      }
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = randomUUID();
      const userData = {
        id,
        username: insertUser.username,
        password: insertUser.password,
        name: insertUser.name,
        email: insertUser.email,
        tipo: insertUser.tipo,
        role: insertUser.role,
        empresaId: insertUser.empresaId || null,
        emailVerificado: insertUser.emailVerificado || false,
        tokenVerificacao: null,
        dataVerificacao: null,
        createdAt: new Date()
      };
      
      await db.insert(users).values(userData);
      
      const createdUser = await this.getUser(id);
      if (!createdUser) {
        throw new Error("Usuário não encontrado após criação");
      }
      
      return createdUser;
    } catch (error) {
      console.error('Erro em createUser:', error);
      throw new Error("Erro ao criar usuário: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      return await db.select().from(products).orderBy(products.name);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const result = await db.select().from(products).where(eq(products.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return undefined;
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const id = randomUUID();
      const productData = {
        id,
        code: insertProduct.code,
        name: insertProduct.name,
        categoryId: insertProduct.categoryId,
        locationId: insertProduct.locationId,
        quantity: insertProduct.quantity,
        minQuantity: insertProduct.minQuantity,
        unitPrice: insertProduct.unitPrice,
        description: insertProduct.description,
        createdAt: new Date()
      };
      await db.insert(products).values(productData);
      const result = await db.select().from(products).where(eq(products.id, id));
      if (!result[0]) throw new Error("Produto não encontrado após criação");
      return result[0];
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error("Erro ao criar produto");
    }
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    try {
      const updateData: any = { ...productData };
      await db.update(products).set(updateData).where(eq(products.id, id));
      const updated = await this.getProduct(id);
      if (!updated) throw new Error("Product not found");
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const product = await this.getProduct(id);
      if (!product) {
        throw new Error("Produto não encontrado");
      }

      await db.transaction(async (tx) => {
        try {
          const productMovements = await tx.select()
            .from(movements)
            .where(eq(movements.productId, id));
          
          if (productMovements.length > 0) {
            await tx.delete(movements).where(eq(movements.productId, id));
          }
        } catch (movementError) {
          throw new Error(`Erro ao excluir movimentações: ${movementError}`);
        }

        try {
          const inventoryCountsResult = await tx.select()
            .from(inventoryCounts)
            .where(eq(inventoryCounts.productId, id));
          
          if (inventoryCountsResult.length > 0) {
            await tx.delete(inventoryCounts).where(eq(inventoryCounts.productId, id));
          }
        } catch (inventoryError) {
          throw new Error(`Erro ao excluir contagens de inventário: ${inventoryError}`);
        }

        try {
          const nfeProductsResult = await tx.select()
            .from(nfeProducts)
            .where(eq(nfeProducts.productId, id));
          
          if (nfeProductsResult.length > 0) {
            await tx.update(nfeProducts)
              .set({ productId: null })
              .where(eq(nfeProducts.productId, id));
          }
        } catch (nfeError) {
          throw new Error(`Erro ao atualizar produtos NFe: ${nfeError}`);
        }

        await tx.delete(products).where(eq(products.id, id));
      });

    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      if (error instanceof Error) {
        if (error.message.includes('violates foreign key constraint')) {
          throw new Error('Não é possível excluir o produto pois ele está vinculado a outros registros no sistema.');
        } else if (error.message.includes('syntax error')) {
          throw new Error('Erro de sintaxe no banco de dados. Contate o administrador.');
        } else {
          throw new Error(`Erro ao excluir produto: ${error.message}`);
        }
      } else {
        throw new Error('Erro desconhecido ao excluir produto');
      }
    }
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      return await db.select().from(products).where(eq(products.categoryId, categoryId)).orderBy(products.name);
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return [];
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories).orderBy(categories.name);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  async getCategory(id: string): Promise<Category | undefined> {
    try {
      const result = await db.select().from(categories).where(eq(categories.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return undefined;
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    try {
      const id = randomUUID();
      const categoryData = { 
        id, 
        name: insertCategory.name, 
        type: insertCategory.type, 
        description: insertCategory.description 
      };
      await db.insert(categories).values(categoryData);
      return categoryData as Category;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  async getLocations(): Promise<Location[]> {
    try {
      return await db.select().from(locations).orderBy(locations.name);
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      return [];
    }
  }

  async getLocation(id: string): Promise<Location | undefined> {
    try {
      const result = await db.select().from(locations).where(eq(locations.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      return undefined;
    }
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    try {
      const id = randomUUID();
      const locationData = { 
        id, 
        name: insertLocation.name, 
        description: insertLocation.description 
      };
      await db.insert(locations).values(locationData);
      return locationData as Location;
    } catch (error) {
      console.error('Erro ao criar localização:', error);
      throw error;
    }
  }

  async updateLocation(id: string, locationData: Partial<InsertLocation>): Promise<Location> {
    try {
      const existingLocation = await this.getLocation(id);
      if (!existingLocation) {
        throw new Error("Local não encontrado");
      }

      await db.update(locations).set(locationData).where(eq(locations.id, id));
      
      const updated = await this.getLocation(id);
      if (!updated) {
        throw new Error("Local não encontrado após atualização");
      }
      
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      throw error;
    }
  }

  async deleteLocation(id: string): Promise<void> {
    try {
      const location = await this.getLocation(id);
      if (!location) {
        throw new Error("Local não encontrado");
      }

      const products = await this.getProducts();
      const productsUsingLocation = products.filter(product => product.locationId === id);
      
      if (productsUsingLocation.length > 0) {
        throw new Error(`Existem ${productsUsingLocation.length} produtos vinculados a este local. Movimente os produtos para outro local antes de excluir.`);
      }

      await db.delete(locations).where(eq(locations.id, id));
      
    } catch (error) {
      console.error('Erro ao deletar localização:', error);
      throw error;
    }
  }

  async getMovements(): Promise<Movement[]> {
    try {
      return await db.select().from(movements).orderBy(desc(movements.createdAt));
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      return [];
    }
  }

  async createMovement(insertMovement: InsertMovement): Promise<Movement> {
    try {
      const id = randomUUID();
      const movementData = {
        id,
        productId: insertMovement.productId,
        type: insertMovement.type,
        quantity: insertMovement.quantity,
        userId: insertMovement.userId,
        notes: insertMovement.notes,
        createdAt: new Date()
      };
      await db.insert(movements).values(movementData);
      return movementData as Movement;
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      throw error;
    }
  }

  async getMovementsByProduct(productId: string): Promise<Movement[]> {
    try {
      return await db.select()
        .from(movements)
        .where(eq(movements.productId, productId));
    } catch (error) {
      console.error('Erro ao buscar movimentações por produto:', error);
      return [];
    }
  }

  async getInventories(): Promise<Inventory[]> {
    try {
      return await db.select().from(inventories).orderBy(desc(inventories.createdAt));
    } catch (error) {
      console.error('Erro ao buscar inventários:', error);
      return [];
    }
  }

  async getInventory(id: string): Promise<Inventory | undefined> {
    try {
      const result = await db.select().from(inventories).where(eq(inventories.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar inventário:', error);
      return undefined;
    }
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    try {
      const id = randomUUID();
      let userId = insertInventory.userId;
      if (!userId) userId = await this.ensureDefaultUser();
      const inventoryData = { 
        id, 
        name: insertInventory.name,
        userId: userId, 
        createdAt: new Date(), 
        status: 'em_andamento' as const,
        finishedAt: null
      };
      await db.insert(inventories).values(inventoryData);
      const result = await db.select().from(inventories).where(eq(inventories.id, id));
      if (!result[0]) throw new Error("Inventário não encontrado após criação");
      return result[0];
    } catch (error) {
      console.error('Erro ao criar inventário:', error);
      throw new Error("Erro ao criar inventário");
    }
  }

  async updateInventory(id: string, inventoryData: Partial<InsertInventory>): Promise<Inventory> {
    try {
      await db.update(inventories).set(inventoryData).where(eq(inventories.id, id));
      const updated = await db.select().from(inventories).where(eq(inventories.id, id));
      if (!updated[0]) throw new Error("Inventory not found");
      return updated[0];
    } catch (error) {
      console.error('Erro ao atualizar inventário:', error);
      throw error;
    }
  }

  async finalizeInventory(id: string): Promise<Inventory> {
    try {
      await db.update(inventories).set({ status: 'finalizado', finishedAt: new Date() }).where(eq(inventories.id, id));
      const updated = await db.select().from(inventories).where(eq(inventories.id, id));
      if (!updated[0]) throw new Error("Inventário não encontrado");
      return updated[0];
    } catch (error) {
      console.error('Erro ao finalizar inventário:', error);
      throw new Error("Erro ao finalizar inventário");
    }
  }

  async reopenInventory(id: string): Promise<Inventory> {
    try {
      await db.update(inventories)
        .set({ 
          status: 'em_andamento', 
          finishedAt: null 
        })
        .where(eq(inventories.id, id));
      
      const updated = await db.select().from(inventories).where(eq(inventories.id, id));
      if (!updated[0]) throw new Error("Inventário não encontrado");
      return updated[0];
    } catch (error) {
      console.error('Erro ao reabrir inventário:', error);
      throw new Error("Erro ao reabrir inventário");
    }
  }

  async getInventoryCounts(inventoryId: string): Promise<InventoryCount[]> {
    try {
      return await db.select().from(inventoryCounts).where(eq(inventoryCounts.inventoryId, inventoryId)).orderBy(inventoryCounts.createdAt);
    } catch (error) {
      console.error('Erro ao buscar contagens de inventário:', error);
      return [];
    }
  }

  async createInventoryCount(insertCount: InsertInventoryCount): Promise<InventoryCount> {
    try {
      const existingCount = await db.select().from(inventoryCounts).where(and(eq(inventoryCounts.inventoryId, insertCount.inventoryId), eq(inventoryCounts.productId, insertCount.productId)));
      if (existingCount.length > 0) {
        const id = existingCount[0].id;
        await db.update(inventoryCounts).set({ 
          countedQuantity: insertCount.countedQuantity, 
          difference: insertCount.difference, 
          notes: insertCount.notes 
        }).where(eq(inventoryCounts.id, id));
        const updated = await db.select().from(inventoryCounts).where(eq(inventoryCounts.id, id));
        return updated[0];
      } else {
        const id = randomUUID();
        const countData = { 
          id, 
          inventoryId: insertCount.inventoryId,
          productId: insertCount.productId,
          countedQuantity: insertCount.countedQuantity,
          difference: insertCount.difference,
          notes: insertCount.notes,
          createdAt: new Date()
        };
        await db.insert(inventoryCounts).values(countData);
        const result = await db.select().from(inventoryCounts).where(eq(inventoryCounts.id, id));
        return result[0];
      }
    } catch (error) {
      console.error('Erro ao criar contagem de inventário:', error);
      throw new Error("Erro ao criar contagem de inventário");
    }
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    try {
      const id = randomUUID();
      const reportData = { 
        id, 
        name: insertReport.name,
        type: insertReport.type,
        format: insertReport.format,
        filters: insertReport.filters || {},
        generatedBy: insertReport.generatedBy,
        filePath: insertReport.filePath,
        fileSize: 0,
        createdAt: new Date()
      };
      await db.insert(reports).values(reportData);
      return reportData as Report;
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      throw error;
    }
  }

  async getReports(): Promise<Report[]> {
    try {
      return await db.select().from(reports).orderBy(desc(reports.createdAt));
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      return [];
    }
  }

  async getReport(id: string): Promise<Report | undefined> {
    try {
      const result = await db.select().from(reports).where(eq(reports.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      return undefined;
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      await db.delete(reports).where(eq(reports.id, id));
    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      throw error;
    }
  }

  async getProductsReport(): Promise<any> {
    try {
      const products = await this.getProducts();
      const categories = await this.getCategories();
      const locations = await this.getLocations();

      const enrichedProducts = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const location = locations.find(l => l.id === product.locationId);
        const unitPrice = parseFloat(product.unitPrice?.toString() || '0');
        const totalValue = unitPrice * product.quantity;
        
        return {
          id: product.id,
          codigo: product.code || 'N/A',
          nome: product.name,
          categoria: category?.name || 'Sem Categoria',
          localizacao: location?.name || 'Sem Local',
          quantidade: product.quantity,
          estoque_minimo: product.minQuantity,
          preco_unitario: unitPrice,
          valor_total: totalValue,
          descricao: product.description || '',
          status: product.quantity === 0 ? 'SEM ESTOQUE' : 
                  product.quantity <= product.minQuantity ? 'ESTOQUE BAIXO' : 'NORMAL'
        };
      });

      const totalValue = enrichedProducts.reduce((sum, p) => sum + p.valor_total, 0);
      const lowStockCount = products.filter(p => p.quantity <= p.minQuantity).length;
      const outOfStockCount = products.filter(p => p.quantity === 0).length;

      const result = {
        titulo: 'Relatório de Produtos',
        produtos: enrichedProducts,
        resumo: {
          total_produtos: products.length,
          valor_total_estoque: totalValue,
          produtos_estoque_baixo: lowStockCount,
          produtos_sem_estoque: outOfStockCount,
          produtos_normais: products.length - lowStockCount - outOfStockCount
        },
        gerado_em: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Erro ao gerar relatório de produtos:', error);
      throw new Error('Erro ao gerar relatório de produtos');
    }
  }

  async getLowStockProducts(): Promise<any> {
    try {
      const products = await this.getProducts();
      const categories = await this.getCategories();
      const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);

      const enrichedProducts = lowStockProducts.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const unitPrice = parseFloat(product.unitPrice?.toString() || '0');
        const difference = product.minQuantity - product.quantity;
        const valueAtRisk = unitPrice * difference;
        
        return {
          id: product.id,
          codigo: product.code || 'N/A',
          nome: product.name,
          categoria: category?.name || 'Sem Categoria',
          quantidade_atual: product.quantity,
          estoque_minimo: product.minQuantity,
          diferenca: difference,
          preco_unitario: unitPrice,
          valor_em_risco: valueAtRisk,
          urgencia: product.quantity === 0 ? 'CRÍTICO' : 'ALERTA',
          acao_recomendada: product.quantity === 0 ? 'REPOR URGENTEMENTE' : 'MONITORAR E REPOR'
        };
      });

      const criticalProducts = lowStockProducts.filter(p => p.quantity === 0).length;
      const warningProducts = lowStockProducts.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length;
      const totalValueAtRisk = enrichedProducts.reduce((sum, p) => sum + p.valor_em_risco, 0);

      const result = {
        titulo: 'Relatório de Estoque Baixo',
        produtos: enrichedProducts,
        resumo: {
          total_estoque_baixo: lowStockProducts.length,
          produtos_criticos: criticalProducts,
          produtos_alerta: warningProducts,
          valor_total_em_risco: totalValueAtRisk
        },
        gerado_em: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Erro ao gerar relatório de estoque baixo:', error);
      throw new Error('Erro ao gerar relatório de estoque baixo');
    }
  }

  async getFinancialReport(): Promise<any> {
    try {
      const products = await this.getProducts();
      const categories = await this.getCategories();
      
      const totalValue = products.reduce((sum, product) => {
        const price = parseFloat(product.unitPrice?.toString() || '0');
        return sum + (price * product.quantity);
      }, 0);

      const valorPorCategoria = categories.map(category => {
        const categoryProducts = products.filter(p => p.categoryId === category.id);
        const valorCategoria = categoryProducts.reduce((sum, product) => {
          const price = parseFloat(product.unitPrice?.toString() || '0');
          return sum + (price * product.quantity);
        }, 0);
        
        return {
          categoria: category.name,
          quantidade_produtos: categoryProducts.length,
          valor_total: valorCategoria,
          percentual: totalValue > 0 ? (valorCategoria / totalValue) * 100 : 0
        };
      }).filter(item => item.quantidade_produtos > 0);

      const topProdutos = products
        .map(product => {
          const category = categories.find(c => c.id === product.categoryId);
          const unitPrice = parseFloat(product.unitPrice?.toString() || '0');
          const totalValue = unitPrice * product.quantity;
          
          return {
            nome: product.name,
            codigo: product.code || 'N/A',
            categoria: category?.name || 'Sem Categoria',
            quantidade: product.quantity,
            preco_unitario: unitPrice,
            valor_total: totalValue
          };
        })
        .sort((a, b) => b.valor_total - a.valor_total)
        .slice(0, 10);

      const result = {
        titulo: 'Relatório Financeiro do Estoque',
        resumo: {
          valor_total_estoque: totalValue,
          total_produtos: products.length,
          valor_medio_produto: products.length > 0 ? totalValue / products.length : 0,
          investimento_total: totalValue
        },
        valor_por_categoria: valorPorCategoria,
        top_produtos: topProdutos,
        gerado_em: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      throw new Error('Erro ao gerar relatório financeiro');
    }
  }

  async getMovementsReport(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      let movements = await this.getMovements();
      const products = await this.getProducts();

      if (startDate || endDate) {
        movements = movements.filter(movement => {
          const movementDate = new Date(movement.createdAt);
          const matchesStart = !startDate || movementDate >= startDate;
          const matchesEnd = !endDate || movementDate <= endDate;
          return matchesStart && matchesEnd;
        });
      }

      const enrichedMovements = movements.map(movement => {
        const product = products.find(p => p.id === movement.productId);
        return {
          id: movement.id,
          produto: product?.name || 'Produto não encontrado',
          codigo_produto: product?.code || 'N/A',
          tipo: movement.type === 'entrada' ? 'ENTRADA' : movement.type === 'saida' ? 'SAÍDA' : 'AJUSTE',
          quantidade: movement.quantity,
          data: new Date(movement.createdAt).toLocaleDateString('pt-BR'),
          hora: new Date(movement.createdAt).toLocaleTimeString('pt-BR'),
          observacoes: movement.notes || 'Sem observações'
        };
      });

      const entradaTotal = movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
      const saidaTotal = movements.filter(m => m.type === 'saida').reduce((sum, m) => sum + m.quantity, 0);

      const result = {
        titulo: 'Relatório de Movimentações',
        periodo: {
          inicio: startDate?.toISOString().split('T')[0] || 'Todo o período',
          fim: endDate?.toISOString().split('T')[0] || 'Todo o período'
        },
        movimentacoes: enrichedMovements,
        resumo: {
          total_movimentacoes: movements.length,
          entradas: movements.filter(m => m.type === 'entrada').length,
          saidas: movements.filter(m => m.type === 'saida').length,
          ajustes: movements.filter(m => m.type === 'ajuste').length,
          quantidade_total_entrada: entradaTotal,
          quantidade_total_saida: saidaTotal,
          saldo: entradaTotal - saidaTotal
        },
        gerado_em: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Erro ao gerar relatório de movimentações:', error);
      throw new Error('Erro ao gerar relatório de movimentações');
    }
  }

  async getInventoryReport(): Promise<any> {
    try {
      const inventories = await this.getInventories();
      const inventoryCounts = await Promise.all(
        inventories.map(inv => this.getInventoryCounts(inv.id))
      );

      const enrichedInventories = inventories.map((inventory, index) => {
        const counts = inventoryCounts[index];
        const produtosComDivergencia = counts.filter(c => c.difference !== 0).length;
        const precisao = counts.length > 0 ? ((counts.length - produtosComDivergencia) / counts.length) * 100 : 100;
        
        return {
          id: inventory.id,
          nome: inventory.name,
          status: inventory.status === 'finalizado' ? 'FINALIZADO' : 'EM ANDAMENTO',
          data_inicio: new Date(inventory.createdAt).toLocaleDateString('pt-BR'),
          data_fim: inventory.finishedAt ? new Date(inventory.finishedAt).toLocaleDateString('pt-BR') : 'Em andamento',
          total_produtos: counts.length,
          produtos_com_divergencia: produtosComDivergencia,
          precisao: precisao.toFixed(2) + '%',
          responsavel: inventory.userId
        };
      });

      const finishedInventories = inventories.filter(i => i.status === 'finalizado').length;
      const ongoingInventories = inventories.filter(i => i.status === 'em_andamento').length;
      const overallAccuracy = enrichedInventories.length > 0 ? 
        enrichedInventories.reduce((sum, inv) => sum + parseFloat(inv.precisao), 0) / enrichedInventories.length : 100;

      const result = {
        titulo: 'Relatório de Inventários',
        inventarios: enrichedInventories,
        resumo: {
          total_inventarios: inventories.length,
          inventarios_finalizados: finishedInventories,
          inventarios_andamento: ongoingInventories,
          precisao_geral: overallAccuracy.toFixed(2) + '%'
        },
        gerado_em: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Erro ao gerar relatório de inventários:', error);
      throw new Error('Erro ao gerar relatório de inventários');
    }
  }

  async getProductsByLocationReport(): Promise<any> {
    try {
      const products = await this.getProducts();
      const locations = await this.getLocations();
      const categories = await this.getCategories();

      const produtosPorLocal = locations.map(location => {
        const locationProducts = products.filter(product => product.locationId === location.id);
        const totalValue = locationProducts.reduce((sum, product) => {
          const price = parseFloat(product.unitPrice?.toString() || '0');
          return sum + (price * product.quantity);
        }, 0);
        
        const produtosEnriquecidos = locationProducts.map(product => {
          const category = categories.find(c => c.id === product.categoryId);
          const unitPrice = parseFloat(product.unitPrice?.toString() || '0');
          const totalValue = unitPrice * product.quantity;
          
          return {
            codigo: product.code || 'N/A',
            nome: product.name,
            categoria: category?.name || 'Sem Categoria',
            quantidade: product.quantity,
            preco_unitario: unitPrice,
            valor_total: totalValue,
            status: product.quantity <= product.minQuantity ? 'ESTOQUE BAIXO' : 'NORMAL'
          };
        });

        return {
          local: location.name,
          descricao: location.description || 'Sem descrição',
          produtos: produtosEnriquecidos,
          resumo: {
            total_produtos: locationProducts.length,
            quantidade_total: locationProducts.reduce((sum, p) => sum + p.quantity, 0),
            valor_total: totalValue,
            produtos_estoque_baixo: locationProducts.filter(p => p.quantity <= p.minQuantity).length
          }
        };
      });

      const valorTotalGeral = produtosPorLocal.reduce((sum, local) => sum + local.resumo.valor_total, 0);
      const totalProdutosGeral = produtosPorLocal.reduce((sum, local) => sum + local.resumo.total_produtos, 0);

      const result = {
        titulo: 'Relatório de Produtos por Local',
        produtos_por_local: produtosPorLocal,
        resumo_geral: {
          total_locais: locations.length,
          total_produtos: totalProdutosGeral,
          valor_total_estoque: valorTotalGeral,
          local_mais_valioso: produtosPorLocal.sort((a, b) => b.resumo.valor_total - a.resumo.valor_total)[0]?.local || 'N/A',
          local_mais_produtos: produtosPorLocal.sort((a, b) => b.resumo.total_produtos - a.resumo.total_produtos)[0]?.local || 'N/A'
        },
        gerado_em: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Erro ao gerar relatório de produtos por local:', error);
      throw new Error('Erro ao gerar relatório de produtos por local');
    }
  }

  async createImportHistory(importData: InsertImportHistory): Promise<ImportHistory> {
    try {
      const id = randomUUID();
      const historyData = { 
        id, 
        fileName: importData.fileName,
        status: importData.status,
        productsFound: importData.productsFound || 0,
        productsCreated: importData.productsCreated || 0,
        productsUpdated: importData.productsUpdated || 0,
        supplier: importData.supplier || 'Fornecedor não identificado',
        supplierCnpj: importData.supplierCnpj || '',
        supplierAddress: importData.supplierAddress || '',
        nfeNumber: importData.nfeNumber || '',
        nfeKey: importData.nfeKey || '',
        emissionDate: importData.emissionDate || new Date(),
        totalValue: importData.totalValue?.toString() || '0',
        userId: importData.userId,
        processedAt: importData.processedAt,
        errorMessage: importData.errorMessage,
        createdAt: new Date()
      };
      await db.insert(importHistory).values(historyData);
      return historyData as ImportHistory;
    } catch (error) {
      console.error('Erro ao criar histórico de importação:', error);
      throw error;
    }
  }

  async getImportHistory(): Promise<ImportHistory[]> {
    try {
      return await db.select().from(importHistory).orderBy(desc(importHistory.createdAt));
    } catch (error) {
      console.error('Erro ao buscar histórico de importação:', error);
      return [];
    }
  }

  async getImportHistoryById(id: string): Promise<ImportHistory | undefined> {
    try {
      const result = await db.select().from(importHistory).where(eq(importHistory.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar histórico de importação por ID:', error);
      return undefined;
    }
  }

  async updateImportHistory(id: string, importData: Partial<InsertImportHistory>): Promise<ImportHistory> {
    try {
      const updateData: any = { ...importData };
      
      if (importData.status === 'processado' && !updateData.processedAt) {
        updateData.processedAt = new Date();
      }
      
      await db.update(importHistory).set(updateData).where(eq(importHistory.id, id));
      const updated = await this.getImportHistoryById(id);
      if (!updated) throw new Error("Histórico de importação não encontrado");
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar histórico de importação:', error);
      throw error;
    }
  }

  async deleteImportHistory(id: string): Promise<void> {
    try {
      await db.delete(nfeProducts).where(eq(nfeProducts.importHistoryId, id));
      await db.delete(nfeData).where(eq(nfeData.importHistoryId, id));
      await db.delete(importHistory).where(eq(importHistory.id, id));
    } catch (error) {
      console.error('Erro ao excluir importação:', error);
      throw new Error("Erro ao excluir importação");
    }
  }

  async createNfeProduct(nfeProduct: InsertNfeProduct): Promise<NfeProduct> {
    try {
      const id = randomUUID();
      const productData = { 
        id,
        importHistoryId: nfeProduct.importHistoryId,
        productId: nfeProduct.productId,
        nfeCode: nfeProduct.nfeCode,
        code: nfeProduct.code || nfeProduct.nfeCode || 'N/A',
        name: nfeProduct.name,
        quantity: nfeProduct.quantity,
        unitPrice: nfeProduct.unitPrice?.toString() || '0',
        unit: nfeProduct.unit,
        totalValue: nfeProduct.totalValue?.toString() || '0',
        nfeData: nfeProduct.nfeData || {}
      };
      await db.insert(nfeProducts).values(productData);
      return productData as NfeProduct;
    } catch (error) {
      console.error('Erro ao criar produto NFe:', error);
      throw error;
    }
  }

  async getNfeProductsByImport(importHistoryId: string): Promise<NfeProduct[]> {
    try {
      return await db.select().from(nfeProducts).where(eq(nfeProducts.importHistoryId, importHistoryId));
    } catch (error) {
      console.error('Erro ao buscar produtos NFe por importação:', error);
      return [];
    }
  }

  async createNfeData(insertNfeData: InsertNfeData): Promise<NfeData> {
    try {
      const id = randomUUID();

      let emissionDate: Date;
      try {
        emissionDate = new Date(insertNfeData.emissionDate);
        if (isNaN(emissionDate.getTime())) {
          emissionDate = new Date();
        }
      } catch {
        emissionDate = new Date();
      }

      const data = { 
        id, 
        importHistoryId: insertNfeData.importHistoryId,
        accessKey: insertNfeData.accessKey,
        documentNumber: insertNfeData.documentNumber,
        supplier: insertNfeData.supplier || {},
        emissionDate: emissionDate,
        totalValue: insertNfeData.totalValue?.toString() || '0',
        xmlContent: insertNfeData.xmlContent || '',
        rawData: insertNfeData.rawData || {},
        createdAt: new Date()
      };

      if (!data.importHistoryId) {
        throw new Error("importHistoryId é obrigatório para criar dados NFe");
      }

      await db.insert(nfeData).values(data);
      
      return data as NfeData;
    } catch (error) {
      console.error('Erro ao salvar dados NFe:', error);
      throw new Error(`Erro ao salvar dados NFe: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getNfeDataByImport(importHistoryId: string): Promise<NfeData | undefined> {
    try {
      const result = await db.select().from(nfeData).where(eq(nfeData.importHistoryId, importHistoryId));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar dados NFe por importação:', error);
      return undefined;
    }
  }

  async getNfeDataByAccessKey(accessKey: string): Promise<NfeData | undefined> {
    try {
      const result = await db.select().from(nfeData).where(eq(nfeData.accessKey, accessKey));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar dados NFe por chave de acesso:', error);
      return undefined;
    }
  }

  async processNfeImport(fileData: any, userId?: string): Promise<ImportHistory> {
    try {
      let importRecord;
      
      try {
        const xmlContent = fileData.xmlContent || '';
        
        importRecord = await this.createImportHistory({
          fileName: fileData.fileName,
          status: 'processando',
          productsFound: fileData.products?.length || 0,
          productsCreated: 0,
          productsUpdated: 0,
          supplier: fileData.supplier?.name || 'Processando...',
          supplierCnpj: fileData.supplier?.cnpj || '',
          supplierAddress: fileData.supplier?.address?.street || '',
          nfeNumber: fileData.documentNumber || '...',
          nfeKey: fileData.accessKey || '',
          emissionDate: new Date(fileData.emissionDate || new Date()),
          totalValue: fileData.totalValue || 0,
          userId: userId,
          errorMessage: null
        });

        if (fileData.accessKey) {
          try {
            const nfeDataRecord = await this.createNfeData({
              importHistoryId: importRecord.id,
              accessKey: fileData.accessKey,
              documentNumber: fileData.documentNumber,
              supplier: fileData.supplier,
              emissionDate: new Date(fileData.emissionDate || new Date()),
              totalValue: fileData.totalValue,
              xmlContent: xmlContent,
              rawData: fileData.rawData
            });
          } catch (nfeError) {
            console.error('Erro ao criar dados NFe:', nfeError);
          }
        }

        if (fileData.products && fileData.products.length > 0) {
          let savedProducts = 0;
          for (const product of fileData.products) {
            try {
              await this.createNfeProduct({
                importHistoryId: importRecord.id,
                productId: null,
                nfeCode: product.code,
                code: product.code,
                name: product.name,
                quantity: product.quantity,
                unitPrice: product.unitPrice,
                unit: product.unit,
                totalValue: product.totalValue,
                nfeData: product
              });
              savedProducts++;
            } catch (productError) {
              console.error('Erro ao criar produto NFe:', productError);
            }
          }
        }

        const updatedRecord = await this.updateImportHistory(importRecord.id, {
          status: 'processado',
          productsFound: fileData.products?.length || 0,
          productsCreated: fileData.products?.length || 0,
          productsUpdated: 0,
          supplier: fileData.supplier?.name || 'Fornecedor',
          supplierCnpj: fileData.supplier?.cnpj || '',
          supplierAddress: fileData.supplier?.address?.street || '',
          nfeNumber: fileData.documentNumber || '000001',
          nfeKey: fileData.accessKey || '',
          totalValue: fileData.totalValue || 0,
          processedAt: new Date()
        });

        return updatedRecord;

      } catch (processError) {
        if (importRecord) {
          try {
            await this.updateImportHistory(importRecord.id, {
              status: 'erro',
              errorMessage: processError instanceof Error ? processError.message : 'Erro desconhecido'
            });
          } catch (updateError) {
            console.error('Erro ao atualizar importação com erro:', updateError);
          }
        }
        
        throw processError;
      }

    } catch (error) {
      console.error('Erro na importação:', error);
      throw new Error(`Erro na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createEmpresa(empresa: InsertEmpresa): Promise<Empresa> {
    try {
      const id = randomUUID();
      const empresaData = {
        id,
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        email: empresa.email,
        telefone: empresa.telefone || null,
        website: empresa.website || null,
        cep: empresa.cep || null,
        logradouro: empresa.logradouro || null,
        numero: empresa.numero || null,
        complemento: empresa.complemento || null,
        cidade: empresa.cidade || null,
        estado: empresa.estado || null,
        status: 'pendente',
        dataAprovacao: null,
        plano: 'starter',
        dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(empresas).values(empresaData);
      return empresaData as Empresa;
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }
  }

  async getEmpresa(id: string): Promise<Empresa | undefined> {
    try {
      const result = await db.select().from(empresas).where(eq(empresas.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return undefined;
    }
  }

  async getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined> {
    try {
      const result = await db.select().from(empresas).where(eq(empresas.cnpj, cnpj));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar empresa por CNPJ:', error);
      return undefined;
    }
  }

  async getEmpresaByEmail(email: string): Promise<Empresa | undefined> {
    try {
      const result = await db.select().from(empresas).where(eq(empresas.email, email));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar empresa por email:', error);
      return undefined;
    }
  }

  async updateEmpresa(id: string, empresa: Partial<InsertEmpresa>): Promise<Empresa> {
    try {
      const updateData = {
        ...empresa,
        updatedAt: new Date()
      };
      
      await db.update(empresas).set(updateData).where(eq(empresas.id, id));
      const updated = await this.getEmpresa(id);
      if (!updated) throw new Error("Empresa não encontrada");
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  async createEmailVerificacao(verificacao: InsertEmailVerificacao): Promise<EmailVerificacao> {
    try {
      const id = randomUUID();
      const verificacaoData = {
        id,
        userId: verificacao.userId,
        email: verificacao.email,
        token: verificacao.token,
        tipo: verificacao.tipo,
        expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000),
        utilizado: false,
        createdAt: new Date()
      };
      
      await db.insert(emailVerificacoes).values(verificacaoData);
      return verificacaoData as EmailVerificacao;
    } catch (error) {
      console.error('Erro ao criar verificação de email:', error);
      throw error;
    }
  }

  async getEmailVerificacao(token: string): Promise<EmailVerificacao | undefined> {
    try {
      const result = await db.select().from(emailVerificacoes).where(eq(emailVerificacoes.token, token));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar verificação de email:', error);
      return undefined;
    }
  }

  async marcarEmailComoVerificado(userId: string): Promise<User> {
    try {
      await db.update(users).set({
        emailVerificado: true,
        dataVerificacao: new Date(),
        tokenVerificacao: null
      }).where(eq(users.id, userId));
      
      const updated = await this.getUser(userId);
      if (!updated) throw new Error("Usuário não encontrado");
      return updated;
    } catch (error) {
      console.error('Erro ao marcar email como verificado:', error);
      throw error;
    }
  }

  async utilizarTokenVerificacao(token: string): Promise<EmailVerificacao> {
    try {
      await db.update(emailVerificacoes).set({
        utilizado: true
      }).where(eq(emailVerificacoes.token, token));
      
      const updated = await this.getEmailVerificacao(token);
      if (!updated) throw new Error("Token não encontrado");
      return updated;
    } catch (error) {
      console.error('Erro ao utilizar token de verificação:', error);
      throw error;
    }
  }

  async cadastrarUsuarioIndividual(dados: CadastroUsuario): Promise<{user: User, token: string}> {
    try {
      const isAdmin = dados.email === 'admin@neuropsicocentro.com';
      
      if (!isAdmin) {
        const usuarioExistente = await this.getUserByEmail(dados.email);
        if (usuarioExistente) {
          throw new Error("Já existe um usuário com este email");
        }
      } else {
        const adminExistente = await this.getUserByEmail(dados.email);
        if (adminExistente) {
          throw new Error("Usuário admin já existe");
        }
      }

      const baseUsername = dados.nome.toLowerCase().replace(/\s+/g, '.');
      let username = baseUsername;
      let counter = 1;
      
      while (await this.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
        if (counter > 10) break;
      }

      const user = await this.createUser({
        username,
        password: dados.senha,
        name: dados.nome,
        email: dados.email,
        tipo: 'individual',
        role: isAdmin ? 'super_admin' : 'user',
        emailVerificado: isAdmin
      });

      const token = isAdmin ? 'admin-auto-verified' : randomUUID();
      
      if (!isAdmin) {
        await this.createEmailVerificacao({
          userId: user.id,
          email: user.email,
          token,
          tipo: 'cadastro'
        });
      }

      return { user, token };

    } catch (error) {
      console.error('Erro ao cadastrar usuário individual:', error);
      throw error;
    }
  }

  async cadastrarEmpresa(dados: CadastroEmpresa): Promise<{empresa: Empresa, admin: User, token: string}> {
    try {
      const empresaExistente = await this.getEmpresaByCnpj(dados.empresaCnpj);
      if (empresaExistente) {
        throw new Error("Já existe uma empresa cadastrada com este CNPJ");
      }

      const emailEmpresaExistente = await this.getEmpresaByEmail(dados.empresaEmail);
      if (emailEmpresaExistente) {
        throw new Error("Já existe uma empresa cadastrada com este email");
      }

      const adminExistente = await this.getUserByEmail(dados.adminEmail);
      if (adminExistente) {
        throw new Error("Já existe um usuário com este email de administrador");
      }

      const empresa = await this.createEmpresa({
        nome: dados.empresaNome,
        cnpj: dados.empresaCnpj,
        email: dados.empresaEmail,
        telefone: dados.empresaTelefone,
        website: dados.empresaWebsite,
        cep: dados.empresaCep,
        logradouro: dados.empresaLogradouro,
        numero: dados.empresaNumero,
        complemento: dados.empresaComplemento,
        cidade: dados.empresaCidade,
        estado: dados.empresaEstado
      });

      const baseUsername = dados.adminNome.toLowerCase().replace(/\s+/g, '.');
      let username = baseUsername;
      let counter = 1;
      
      while (await this.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
        if (counter > 10) break;
      }

      const admin = await this.createUser({
        username,
        password: dados.adminSenha,
        name: dados.adminNome,
        email: dados.adminEmail,
        tipo: 'empresa',
        role: 'admin',
        empresaId: empresa.id
      });

      const token = randomUUID();
      await this.createEmailVerificacao({
        userId: admin.id,
        email: admin.email,
        token,
        tipo: 'cadastro'
      });

      return { empresa, admin, token };

    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      throw error;
    }
  }

  async getUsersByEmpresa(empresaId: string): Promise<User[]> {
    try {
      const result = await db.select().from(users).where(eq(users.empresaId, empresaId));
      return result;
    } catch (error) {
      console.error('Erro ao buscar usuários por empresa:', error);
      return [];
    }
  }

  async getEmpresaUsers(empresaId: string): Promise<User[]> {
    return this.getUsersByEmpresa(empresaId);
  }

  async createUserForEmpresa(userData: any, empresaId: string, createdBy: string): Promise<User> {
    try {
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error("Já existe um usuário com este email");
      }

      const baseUsername = userData.name.toLowerCase().replace(/\s+/g, '.');
      let username = baseUsername;
      let counter = 1;
      
      while (await this.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
        if (counter > 10) break;
      }

      const user = await this.createUser({
        username,
        password: userData.password || '123456',
        name: userData.name,
        email: userData.email,
        tipo: 'empresa',
        role: userData.role || 'user',
        empresaId: empresaId,
        emailVerificado: false
      });

      const token = randomUUID();
      await this.createEmailVerificacao({
        userId: user.id,
        email: user.email,
        token,
        tipo: 'cadastro'
      });

      return user;

    } catch (error) {
      console.error('Erro ao criar usuário para empresa:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: 'super_admin' | 'admin' | 'user'): Promise<User> {
    try {
      await db.update(users).set({ role }).where(eq(users.id, userId));
      const updated = await this.getUser(userId);
      if (!updated) throw new Error("Usuário não encontrado");
      
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar role do usuário:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const currentUser = await this.getUser(userId);
      if (!currentUser) {
        throw new Error("Usuário não encontrado");
      }

      if (currentUser.role === 'super_admin') {
        throw new Error("Não é possível deletar um Super Admin");
      }

      try {
        await db.delete(emailVerificacoes).where(eq(emailVerificacoes.userId, userId));
      } catch (emailError) {
        console.error('Erro ao deletar verificações de email:', emailError);
      }

      await db.delete(users).where(eq(users.id, userId));

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  async canUserAccessModule(userId: string, module: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      const permissions = {
        'super_admin': {
          produtos: ['view', 'create', 'edit', 'delete'],
          usuarios: ['view', 'create', 'edit', 'delete'],
          relatorios: ['view', 'create', 'export'],
          configuracoes: ['view', 'edit'],
          importacao: ['view', 'create', 'delete'],
          movimentacoes: ['view', 'create', 'edit', 'delete'],
          inventarios: ['view', 'create', 'edit', 'delete']
        },
        'admin': {
          produtos: ['view', 'create', 'edit', 'delete'],
          usuarios: ['view', 'create', 'edit'],
          relatorios: ['view', 'create', 'export'],
          configuracoes: ['view'],
          importacao: ['view', 'create', 'delete'],
          movimentacoes: ['view', 'create', 'edit', 'delete'],
          inventarios: ['view', 'create', 'edit', 'delete']
        },
        'user': {
          produtos: ['view'],
          usuarios: [],
          relatorios: ['view'],
          configuracoes: [],
          importacao: ['view'],
          movimentacoes: ['view', 'create'],
          inventarios: ['view']
        }
      };

      const userPermissions = permissions[user.role as keyof typeof permissions];
      return userPermissions && module in userPermissions && userPermissions[module as keyof typeof userPermissions].length > 0;
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return false;
    }
  }

  async getUserPermissions(userId: string): Promise<any> {
    try {
      const user = await this.getUser(userId);
      if (!user) return {};

      const permissions = {
        'super_admin': {
          dashboard: { view: true, edit: true },
          produtos: { view: true, create: true, edit: true, delete: true },
          categorias: { view: true, create: true, edit: true, delete: true },
          locais: { view: true, create: true, edit: true, delete: true },
          movimentacoes: { view: true, create: true, edit: true, delete: true },
          inventarios: { view: true, create: true, edit: true, delete: true },
          relatorios: { view: true, create: true, export: true },
          importacao: { view: true, create: true, delete: true },
          usuarios: { view: true, create: true, edit: true, delete: true },
          configuracoes: { view: true, edit: true },
          empresas: { view: true, create: true, edit: true, delete: true }
        },
        'admin': {
          dashboard: { view: true, edit: true },
          produtos: { view: true, create: true, edit: true, delete: true },
          categorias: { view: true, create: true, edit: true, delete: true },
          locais: { view: true, create: true, edit: true, delete: true },
          movimentacoes: { view: true, create: true, edit: true, delete: true },
          inventarios: { view: true, create: true, edit: true, delete: true },
          relatorios: { view: true, create: true, export: true },
          importacao: { view: true, create: true, delete: true },
          usuarios: { view: true, create: true, edit: true },
          configuracoes: { view: true, edit: false },
          empresas: { view: false, create: false, edit: false, delete: false }
        },
        'user': {
          dashboard: { view: true, edit: false },
          produtos: { view: true, create: false, edit: false, delete: false },
          categorias: { view: true, create: false, edit: false, delete: false },
          locais: { view: true, create: false, edit: false, delete: false },
          movimentacoes: { view: true, create: true, edit: false, delete: false },
          inventarios: { view: true, create: false, edit: false, delete: false },
          relatorios: { view: true, create: false, export: false },
          importacao: { view: true, create: false, delete: false },
          usuarios: { view: false, create: false, edit: false, delete: false },
          configuracoes: { view: false, edit: false },
          empresas: { view: false, create: false, edit: false, delete: false }
        }
      };

      return permissions[user.role as keyof typeof permissions] || {};
    } catch (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      return {};
    }
  }
}

export const storage = new DatabaseStorage();