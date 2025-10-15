// server/storage.ts - VERSÃO COMPLETA CORRIGIDA
import { 
  type User, type InsertUser, type Product, type InsertProduct, 
  type Category, type Location, type InsertCategory, type InsertLocation, 
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
  // Métodos existentes
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>; // 🔥 MÉTODO ADICIONADO
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

  // Métodos para relatórios
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  deleteReport(id: string): Promise<void>;
  
  // Métodos para dados dos relatórios
  getProductsReport(): Promise<any>;
  getLowStockProducts(): Promise<any>;
  getFinancialReport(): Promise<any>;
  getMovementsReport(startDate?: Date, endDate?: Date): Promise<any>;
  getInventoryReport(): Promise<any>;
  getProductsByLocationReport(): Promise<any>;

  // Métodos para importação
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
  
  // Método para processar importação completa
  processNfeImport(fileData: any, userId?: string): Promise<ImportHistory>;

  // 🔥 MÉTODOS PARA CADASTRO
  createEmpresa(empresa: InsertEmpresa): Promise<Empresa>;
  getEmpresa(id: string): Promise<Empresa | undefined>;
  getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined>;
  getEmpresaByEmail(email: string): Promise<Empresa | undefined>;
  updateEmpresa(id: string, empresa: Partial<InsertEmpresa>): Promise<Empresa>;
  
  createEmailVerificacao(verificacao: InsertEmailVerificacao): Promise<EmailVerificacao>;
  getEmailVerificacao(token: string): Promise<EmailVerificacao | undefined>;
  marcarEmailComoVerificado(userId: string): Promise<User>;
  utilizarTokenVerificacao(token: string): Promise<EmailVerificacao>;
  
  // Métodos específicos para cadastro
  cadastrarUsuarioIndividual(dados: CadastroUsuario): Promise<{user: User, token: string}>;
  cadastrarEmpresa(dados: CadastroEmpresa): Promise<{empresa: Empresa, admin: User, token: string}>;

  // 🔥 NOVOS MÉTODOS PARA PERMISSÕES
  getUsersByEmpresa(empresaId: string): Promise<User[]>;
  createUserForEmpresa(userData: any, empresaId: string, createdBy: string): Promise<User>;
  updateUserRole(userId: string, role: 'super_admin' | 'admin' | 'user'): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  canUserAccessModule(userId: string, module: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<any>;
  getEmpresaUsers(empresaId: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // 🔥 MÉTODO ensureDefaultUser ATUALIZADO
  async ensureDefaultUser(): Promise<string> {
    try {
      const existingUser = await this.getUserByEmail('admin@stockmaster.com');
      if (existingUser) {
        return existingUser.id;
      }
      
      const defaultUser: InsertUser = {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        email: 'admin@stockmaster.com',
        tipo: 'individual',
        role: 'super_admin', // 🔥 AGORA É SUPER ADMIN
        emailVerificado: true
      };
      const user = await this.createUser(defaultUser);
      return user.id;
    } catch (error) {
      console.error('❌ Erro ao criar usuário padrão:', error);
      throw new Error('Erro ao criar usuário padrão');
    }
  }

  // 🔥 MÉTODO getUsers ADICIONADO
  async getUsers(): Promise<User[]> {
    try {
      console.log('📋 Buscando todos os usuários...');
      const result = await db.select().from(users).orderBy(users.name);
      console.log(`✅ ${result.length} usuários encontrados`);
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return [];
    }
  }

  // 🔥 MÉTODOS EXISTENTES (MANTIDOS)
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log(`🔍 Buscando usuário por email: ${email}`);
      const result = await db.select().from(users).where(eq(users.email, email));
      console.log(`📊 Resultado da busca:`, result.length > 0 ? 'Usuário encontrado' : 'Usuário não encontrado');
      return result[0];
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por email:', error);
      try {
        console.log('🔄 Tentando fallback: buscar por username...');
        const result = await db.select().from(users).where(eq(users.username, email));
        return result[0];
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
        return undefined;
      }
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = randomUUID();
      const user: User = { 
        ...insertUser, 
        id,
        emailVerificado: insertUser.emailVerificado || false,
        tokenVerificacao: null,
        dataVerificacao: null,
        createdAt: new Date()
      };
      
      console.log(`👤 Criando usuário:`, { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        emailVerificado: user.emailVerificado 
      });
      
      await db.insert(users).values(user);
      
      const createdUser = await this.getUser(id);
      if (!createdUser) {
        throw new Error("Usuário não encontrado após criação");
      }
      
      console.log('✅ Usuário criado com sucesso');
      return createdUser;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw new Error("Erro ao criar usuário: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const id = randomUUID();
      const productData = {
        ...insertProduct,
        id,
        unitPrice: insertProduct.unitPrice?.toString() || '0'
      };
      await db.insert(products).values(productData);
      const result = await db.select().from(products).where(eq(products.id, id));
      if (!result[0]) throw new Error("Produto não encontrado após criação");
      return result[0];
    } catch (error) {
      throw new Error("Erro ao criar produto");
    }
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    const updateData = { ...productData };
    if (updateData.unitPrice !== undefined) {
      updateData.unitPrice = updateData.unitPrice.toString();
    }
    await db.update(products).set(updateData).where(eq(products.id, id));
    const updated = await this.getProduct(id);
    if (!updated) throw new Error("Product not found");
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId)).orderBy(products.name);
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    await db.insert(categories).values(category);
    return category;
  }

  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(locations.name);
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id));
    return result[0];
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const location: Location = { ...insertLocation, id };
    await db.insert(locations).values(location);
    return location;
  }

  async getMovements(): Promise<Movement[]> {
    return await db.select().from(movements).orderBy(desc(movements.createdAt));
  }

  async createMovement(insertMovement: InsertMovement): Promise<Movement> {
    const id = randomUUID();
    const movement: Movement = { ...insertMovement, id, createdAt: new Date() };
    await db.insert(movements).values(movement);
    return movement;
  }

  async getMovementsByProduct(productId: string): Promise<Movement[]> {
    return await db.select().from(movements).where(eq(movements.productId, productId)).orderBy(desc(movements.createdAt));
  }

  async getInventories(): Promise<Inventory[]> {
    return await db.select().from(inventories).orderBy(desc(inventories.createdAt));
  }

  async getInventory(id: string): Promise<Inventory | undefined> {
    const result = await db.select().from(inventories).where(eq(inventories.id, id));
    return result[0];
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    try {
      const id = randomUUID();
      let userId = insertInventory.userId;
      if (!userId) userId = await this.ensureDefaultUser();
      const inventoryData = { ...insertInventory, id, userId, createdAt: new Date(), status: 'em_andamento' as const };
      await db.insert(inventories).values(inventoryData);
      const result = await db.select().from(inventories).where(eq(inventories.id, id));
      if (!result[0]) throw new Error("Inventário não encontrado após criação");
      return result[0];
    } catch (error) {
      throw new Error("Erro ao criar inventário");
    }
  }

  async updateInventory(id: string, inventoryData: Partial<InsertInventory>): Promise<Inventory> {
    await db.update(inventories).set(inventoryData).where(eq(inventories.id, id));
    const updated = await db.select().from(inventories).where(eq(inventories.id, id));
    if (!updated[0]) throw new Error("Inventory not found");
    return updated[0];
  }

  async finalizeInventory(id: string): Promise<Inventory> {
    try {
      await db.update(inventories).set({ status: 'finalizado', finishedAt: new Date() }).where(eq(inventories.id, id));
      const updated = await db.select().from(inventories).where(eq(inventories.id, id));
      if (!updated[0]) throw new Error("Inventário não encontrado");
      return updated[0];
    } catch (error) {
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
      throw new Error("Erro ao reabrir inventário");
    }
  }

  async getInventoryCounts(inventoryId: string): Promise<InventoryCount[]> {
    return await db.select().from(inventoryCounts).where(eq(inventoryCounts.inventoryId, inventoryId)).orderBy(inventoryCounts.createdAt);
  }

  async createInventoryCount(insertCount: InsertInventoryCount): Promise<InventoryCount> {
    try {
      const existingCount = await db.select().from(inventoryCounts).where(and(eq(inventoryCounts.inventoryId, insertCount.inventoryId), eq(inventoryCounts.productId, insertCount.productId)));
      if (existingCount.length > 0) {
        const id = existingCount[0].id;
        await db.update(inventoryCounts).set({ countedQuantity: insertCount.countedQuantity, difference: insertCount.difference, notes: insertCount.notes }).where(eq(inventoryCounts.id, id));
        const updated = await db.select().from(inventoryCounts).where(eq(inventoryCounts.id, id));
        return updated[0];
      } else {
        const id = randomUUID();
        const count: InventoryCount = { ...insertCount, id, createdAt: new Date() };
        await db.insert(inventoryCounts).values(count);
        const result = await db.select().from(inventoryCounts).where(eq(inventoryCounts.id, id));
        return result[0];
      }
    } catch (error) {
      throw new Error("Erro ao criar contagem de inventário");
    }
  }

  // MÉTODOS PARA RELATÓRIOS
  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = { 
      ...insertReport, 
      id, 
      createdAt: new Date(),
      fileSize: 0
    };
    await db.insert(reports).values(report);
    return report;
  }

  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async getReport(id: string): Promise<Report | undefined> {
    const result = await db.select().from(reports).where(eq(reports.id, id));
    return result[0];
  }

  async deleteReport(id: string): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  // RELATÓRIO DE PRODUTOS COMPLETO
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
          tipo: product.type,
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
      throw new Error('Erro ao gerar relatório de produtos');
    }
  }

  // RELATÓRIO DE ESTOQUE BAIXO COMPLETO
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
          tipo: product.type,
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
      throw new Error('Erro ao gerar relatório de estoque baixo');
    }
  }

  // RELATÓRIO FINANCEIRO COMPLETO
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
      throw new Error('Erro ao gerar relatório financeiro');
    }
  }

  // RELATÓRIO DE MOVIMENTAÇÕES COMPLETO
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
      throw new Error('Erro ao gerar relatório de movimentações');
    }
  }

  // RELATÓRIO DE INVENTÁRIOS COMPLETO
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
      throw new Error('Erro ao gerar relatório de inventários');
    }
  }

  // RELATÓRIO DE PRODUTOS POR LOCAL COMPLETO
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
      throw new Error('Erro ao gerar relatório de produtos por local');
    }
  }

  // MÉTODOS PARA IMPORTACAO DE XML
  async createImportHistory(importData: InsertImportHistory): Promise<ImportHistory> {
    const id = randomUUID();
    const history: ImportHistory = { 
      ...importData, 
      id, 
      createdAt: new Date(),
      processedAt: importData.status === 'processado' ? new Date() : null,
      productsFound: importData.productsFound || 0,
      productsCreated: importData.productsCreated || 0,
      productsUpdated: importData.productsUpdated || 0,
      supplier: importData.supplier || 'Fornecedor não identificado',
      supplierCnpj: importData.supplierCnpj || '',
      supplierAddress: importData.supplierAddress || '',
      nfeNumber: importData.nfeNumber || '',
      nfeKey: importData.nfeKey || '',
      emissionDate: importData.emissionDate || new Date(),
      totalValue: importData.totalValue?.toString() || '0'
    };
    await db.insert(importHistory).values(history);
    return history;
  }

  async getImportHistory(): Promise<ImportHistory[]> {
    return await db.select().from(importHistory).orderBy(desc(importHistory.createdAt));
  }

  async getImportHistoryById(id: string): Promise<ImportHistory | undefined> {
    const result = await db.select().from(importHistory).where(eq(importHistory.id, id));
    return result[0];
  }

  async updateImportHistory(id: string, importData: Partial<InsertImportHistory>): Promise<ImportHistory> {
    const updateData: any = { ...importData };
    
    if (importData.status === 'processado' && !updateData.processedAt) {
      updateData.processedAt = new Date();
    }
    
    await db.update(importHistory).set(updateData).where(eq(importHistory.id, id));
    const updated = await this.getImportHistoryById(id);
    if (!updated) throw new Error("Histórico de importação não encontrado");
    return updated;
  }

  async deleteImportHistory(id: string): Promise<void> {
    try {
      await db.delete(nfeProducts).where(eq(nfeProducts.importHistoryId, id));
      await db.delete(nfeData).where(eq(nfeData.importHistoryId, id));
      await db.delete(importHistory).where(eq(importHistory.id, id));
      console.log(`✅ Importação ${id} excluída com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao excluir importação ${id}:`, error);
      throw new Error("Erro ao excluir importação");
    }
  }

  async createNfeProduct(nfeProduct: InsertNfeProduct): Promise<NfeProduct> {
    const id = randomUUID();
    const product: NfeProduct = { 
      ...nfeProduct, 
      id,
      unitPrice: nfeProduct.unitPrice?.toString() || '0',
      totalValue: nfeProduct.totalValue?.toString() || '0',
      code: nfeProduct.code || nfeProduct.nfeCode || 'N/A'
    };
    await db.insert(nfeProducts).values(product);
    return product;
  }

  async getNfeProductsByImport(importHistoryId: string): Promise<NfeProduct[]> {
    return await db.select().from(nfeProducts).where(eq(nfeProducts.importHistoryId, importHistoryId));
  }

  // 🔥 MÉTODO createNfeData CORRIGIDO - PROBLEMA DE DATA RESOLVIDO
  async createNfeData(insertNfeData: InsertNfeData): Promise<NfeData> {
    try {
      const id = randomUUID();
      console.log(`💾 Criando dados NFe:`, {
        id,
        importHistoryId: insertNfeData.importHistoryId,
        accessKey: insertNfeData.accessKey,
        xmlContentLength: insertNfeData.xmlContent?.length || 0
      });

      // 🔥 CORREÇÃO CRÍTICA: Validar e formatar a data corretamente
      let emissionDate: Date;
      try {
        emissionDate = new Date(insertNfeData.emissionDate);
        if (isNaN(emissionDate.getTime())) {
          console.warn('⚠️ Data de emissão inválida, usando data atual');
          emissionDate = new Date();
        }
      } catch {
        emissionDate = new Date();
      }

      console.log(`📅 Data de emissão processada:`, emissionDate.toISOString());

      // 🔥 CORREÇÃO: Garantir que todos os campos obrigatórios estejam presentes
      const data: NfeData = { 
        ...insertNfeData, 
        id, 
        createdAt: new Date(),
        emissionDate: emissionDate, // 🔥 DATA CORRIGIDA
        totalValue: insertNfeData.totalValue?.toString() || '0',
        xmlContent: insertNfeData.xmlContent || '',
        rawData: insertNfeData.rawData || {}
      };

      console.log(`📊 Dados NFe preparados para inserção:`, {
        id: data.id,
        importHistoryId: data.importHistoryId,
        accessKey: data.accessKey,
        emissionDate: data.emissionDate,
        xmlContentLength: data.xmlContent.length
      });

      // 🔥 CORREÇÃO: Verificar se importHistoryId está presente
      if (!data.importHistoryId) {
        throw new Error("importHistoryId é obrigatório para criar dados NFe");
      }

      await db.insert(nfeData).values(data);
      console.log(`✅ Dados NFe inseridos no banco: ${id}`);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar dados NFe:', error);
      console.error('📋 Dados que causaram o erro:', {
        importHistoryId: insertNfeData.importHistoryId,
        accessKey: insertNfeData.accessKey,
        emissionDate: insertNfeData.emissionDate,
        xmlContentLength: insertNfeData.xmlContent?.length
      });
      throw new Error(`Erro ao salvar dados NFe: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getNfeDataByImport(importHistoryId: string): Promise<NfeData | undefined> {
    try {
      console.log(`🔍 Buscando dados NFe para importação: ${importHistoryId}`);
      const result = await db.select().from(nfeData).where(eq(nfeData.importHistoryId, importHistoryId));
      console.log(`📊 Dados NFe encontrados: ${result.length}`);
      if (result[0] && result[0].xmlContent) {
        console.log(`📄 XML content disponível: ${result[0].xmlContent.length} bytes`);
      } else {
        console.log(`⚠️ XML content NÃO disponível para importação: ${importHistoryId}`);
      }
      return result[0];
    } catch (error) {
      console.error('❌ Erro ao buscar dados NFe:', error);
      return undefined;
    }
  }

  async getNfeDataByAccessKey(accessKey: string): Promise<NfeData | undefined> {
    const result = await db.select().from(nfeData).where(eq(nfeData.accessKey, accessKey));
    return result[0];
  }

  // 🔥 MÉTODO processNfeImport CORRIGIDO - GARANTIR QUE XML SEJA SALVO
  async processNfeImport(fileData: any, userId?: string): Promise<ImportHistory> {
    try {
      console.log('💾 Tentando salvar importação no banco...');
      
      let importRecord;
      
      try {
        // 🔥 CORREÇÃO CRÍTICA: Garantir que o XML content seja salvo
        const xmlContent = fileData.xmlContent || '';
        
        console.log(`📄 XML content a ser salvo: ${xmlContent.length} bytes`);
        
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

        console.log('✅ Histórico criado:', importRecord.id);

        // 🔥 CORREÇÃO: Salvar dados NFe com XML content - CORRIGIDO
        if (fileData.accessKey) {
          try {
            console.log(`💾 Salvando dados NFe para importação ${importRecord.id}`);
            
            const nfeDataRecord = await this.createNfeData({
              importHistoryId: importRecord.id, // 🔥 AGORA CORRETO - usando importRecord.id
              accessKey: fileData.accessKey,
              documentNumber: fileData.documentNumber,
              supplier: fileData.supplier,
              emissionDate: new Date(fileData.emissionDate || new Date()),
              totalValue: fileData.totalValue,
              xmlContent: xmlContent, // 🔥 AGORA SALVANDO O XML CORRETAMENTE
              rawData: fileData.rawData
            });
            console.log('✅ Dados da NFe salvos:', nfeDataRecord.id);
            console.log(`📄 XML salvo no banco: ${xmlContent.length} bytes`);
          } catch (nfeError) {
            console.error('❌ Erro ao salvar dados NFe:', nfeError);
            // Continuar mesmo com erro nos dados NFe para não quebrar a importação
          }
        }

        // Salvar produtos NFe
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
              console.error('❌ Erro ao salvar produto:', productError);
            }
          }
          console.log(`✅ ${savedProducts} produtos salvos`);
        }

        // Atualizar histórico como processado
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

        console.log('✅ Importação finalizada com sucesso!');
        return updatedRecord;

      } catch (processError) {
        console.error('❌ Erro no processamento:', processError);
        
        if (importRecord) {
          try {
            await this.updateImportHistory(importRecord.id, {
              status: 'erro',
              errorMessage: processError instanceof Error ? processError.message : 'Erro desconhecido'
            });
          } catch (updateError) {
            console.error('❌ Erro ao atualizar status para erro:', updateError);
          }
        }
        
        throw processError;
      }

    } catch (error) {
      console.error('❌ Erro geral no processNfeImport:', error);
      throw new Error(`Erro na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // 🔥 MÉTODOS PARA CADASTRO
  async createEmpresa(empresa: InsertEmpresa): Promise<Empresa> {
    const id = randomUUID();
    const empresaData: Empresa = {
      ...empresa,
      id,
      status: 'pendente',
      dataAprovacao: null,
      plano: 'starter',
      dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.insert(empresas).values(empresaData);
    return empresaData;
  }

  async getEmpresa(id: string): Promise<Empresa | undefined> {
    const result = await db.select().from(empresas).where(eq(empresas.id, id));
    return result[0];
  }

  async getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined> {
    const result = await db.select().from(empresas).where(eq(empresas.cnpj, cnpj));
    return result[0];
  }

  async getEmpresaByEmail(email: string): Promise<Empresa | undefined> {
    const result = await db.select().from(empresas).where(eq(empresas.email, email));
    return result[0];
  }

  async updateEmpresa(id: string, empresa: Partial<InsertEmpresa>): Promise<Empresa> {
    const updateData = {
      ...empresa,
      updatedAt: new Date()
    };
    
    await db.update(empresas).set(updateData).where(eq(empresas.id, id));
    const updated = await this.getEmpresa(id);
    if (!updated) throw new Error("Empresa não encontrada");
    return updated;
  }

  async createEmailVerificacao(verificacao: InsertEmailVerificacao): Promise<EmailVerificacao> {
    const id = randomUUID();
    const verificacaoData: EmailVerificacao = {
      ...verificacao,
      id,
      expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      utilizado: false,
      createdAt: new Date()
    };
    
    await db.insert(emailVerificacoes).values(verificacaoData);
    return verificacaoData;
  }

  async getEmailVerificacao(token: string): Promise<EmailVerificacao | undefined> {
    const result = await db.select().from(emailVerificacoes).where(eq(emailVerificacoes.token, token));
    return result[0];
  }

  async marcarEmailComoVerificado(userId: string): Promise<User> {
    await db.update(users).set({
      emailVerificado: true,
      dataVerificacao: new Date(),
      tokenVerificacao: null
    }).where(eq(users.id, userId));
    
    const updated = await this.getUser(userId);
    if (!updated) throw new Error("Usuário não encontrado");
    return updated;
  }

  async utilizarTokenVerificacao(token: string): Promise<EmailVerificacao> {
    await db.update(emailVerificacoes).set({
      utilizado: true
    }).where(eq(emailVerificacoes.token, token));
    
    const updated = await this.getEmailVerificacao(token);
    if (!updated) throw new Error("Token não encontrado");
    return updated;
  }

  // MÉTODO cadastrarUsuarioIndividual CORRIGIDO
  async cadastrarUsuarioIndividual(dados: CadastroUsuario): Promise<{user: User, token: string}> {
    try {
      console.log('📝 Iniciando cadastro de usuário individual...');
      
      // Verificar se é o admin (email especial)
      const isAdmin = dados.email === 'admin@stockmaster.com';
      
      console.log(`🔍 Verificando email: ${dados.email} (admin: ${isAdmin})`);
      
      // Verificar se email já existe (exceto para admin durante setup)
      if (!isAdmin) {
        const usuarioExistente = await this.getUserByEmail(dados.email);
        if (usuarioExistente) {
          console.log('❌ Email já existe:', dados.email);
          throw new Error("Já existe um usuário com este email");
        }
      } else {
        // Para admin, verificar se já existe
        const adminExistente = await this.getUserByEmail(dados.email);
        if (adminExistente) {
          console.log('❌ Admin já existe');
          throw new Error("Usuário admin já existe");
        }
      }

      // Gerar username único
      const baseUsername = dados.nome.toLowerCase().replace(/\s+/g, '.');
      let username = baseUsername;
      let counter = 1;
      
      while (await this.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
        if (counter > 10) break; // Prevenir loop infinito
      }

      console.log(`👤 Criando usuário com username: ${username}`);

      // Criar usuário
      const user = await this.createUser({
        username,
        password: dados.senha,
        name: dados.nome,
        email: dados.email,
        tipo: 'individual',
        role: isAdmin ? 'super_admin' : 'user', // 🔥 DEFINE ROLE
        // 🔥 ADMIN: Marcar como verificado automaticamente
        emailVerificado: isAdmin
      });

      // Gerar token de verificação (apenas para não-admins)
      const token = isAdmin ? 'admin-auto-verified' : randomUUID();
      
      if (!isAdmin) {
        console.log(`🔐 Criando token de verificação para: ${user.email}`);
        await this.createEmailVerificacao({
          userId: user.id,
          email: user.email,
          token,
          tipo: 'cadastro'
        });
      } else {
        console.log('⚡ Admin criado - sem verificação necessária');
      }

      console.log('✅ Cadastro de usuário individual concluído com sucesso');
      return { user, token };

    } catch (error) {
      console.error('❌ Erro no cadastrarUsuarioIndividual:', error);
      throw error; // Re-lançar o erro para ser tratado no route
    }
  }

  async cadastrarEmpresa(dados: CadastroEmpresa): Promise<{empresa: Empresa, admin: User, token: string}> {
    try {
      console.log('🏢 Iniciando cadastro de empresa...');
      
      // Verificar se CNPJ já existe
      const empresaExistente = await this.getEmpresaByCnpj(dados.empresaCnpj);
      if (empresaExistente) {
        throw new Error("Já existe uma empresa cadastrada com este CNPJ");
      }

      // Verificar se email da empresa já existe
      const emailEmpresaExistente = await this.getEmpresaByEmail(dados.empresaEmail);
      if (emailEmpresaExistente) {
        throw new Error("Já existe uma empresa cadastrada com este email");
      }

      // Verificar se email do admin já existe
      const adminExistente = await this.getUserByEmail(dados.adminEmail);
      if (adminExistente) {
        throw new Error("Já existe um usuário com este email de administrador");
      }

      // Criar empresa
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

      console.log(`🏢 Empresa criada: ${empresa.nome}`);

      // Gerar username único para admin
      const baseUsername = dados.adminNome.toLowerCase().replace(/\s+/g, '.');
      let username = baseUsername;
      let counter = 1;
      
      while (await this.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
        if (counter > 10) break;
      }

      console.log(`👤 Criando admin com username: ${username}`);

      // Criar usuário administrador
      const admin = await this.createUser({
        username,
        password: dados.adminSenha,
        name: dados.adminNome,
        email: dados.adminEmail,
        tipo: 'empresa',
        role: 'admin', // 🔥 ADMIN DA EMPRESA
        empresaId: empresa.id
      });

      // Gerar token de verificação
      const token = randomUUID();
      await this.createEmailVerificacao({
        userId: admin.id,
        email: admin.email,
        token,
        tipo: 'cadastro'
      });

      console.log('✅ Cadastro de empresa concluído com sucesso');
      return { empresa, admin, token };

    } catch (error) {
      console.error('❌ Erro no cadastrarEmpresa:', error);
      throw error;
    }
  }

  // 🔥 NOVOS MÉTODOS DE PERMISSÕES

  async getUsersByEmpresa(empresaId: string): Promise<User[]> {
    try {
      const result = await db.select().from(users).where(eq(users.empresaId, empresaId));
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários da empresa:', error);
      return [];
    }
  }

  async getEmpresaUsers(empresaId: string): Promise<User[]> {
    return this.getUsersByEmpresa(empresaId);
  }

  async createUserForEmpresa(userData: any, empresaId: string, createdBy: string): Promise<User> {
    try {
      console.log('👥 Criando usuário para empresa...', { userData, empresaId, createdBy });

      // Verificar se email já existe
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error("Já existe um usuário com este email");
      }

      // Gerar username único
      const baseUsername = userData.name.toLowerCase().replace(/\s+/g, '.');
      let username = baseUsername;
      let counter = 1;
      
      while (await this.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
        if (counter > 10) break;
      }

      // Criar usuário
      const user = await this.createUser({
        username,
        password: userData.password || '123456', // Senha padrão
        name: userData.name,
        email: userData.email,
        tipo: 'empresa',
        role: userData.role || 'user',
        empresaId: empresaId,
        emailVerificado: false
      });

      // Gerar token de verificação
      const token = randomUUID();
      await this.createEmailVerificacao({
        userId: user.id,
        email: user.email,
        token,
        tipo: 'cadastro'
      });

      console.log('✅ Usuário criado para empresa com sucesso');
      return user;

    } catch (error) {
      console.error('❌ Erro ao criar usuário para empresa:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: 'super_admin' | 'admin' | 'user'): Promise<User> {
    try {
      await db.update(users).set({ role }).where(eq(users.id, userId));
      const updated = await this.getUser(userId);
      if (!updated) throw new Error("Usuário não encontrado");
      
      console.log(`✅ Role do usuário ${userId} atualizado para: ${role}`);
      return updated;
    } catch (error) {
      console.error('❌ Erro ao atualizar role do usuário:', error);
      throw error;
    }
  }

  // 🔥 MÉTODO deleteUser CORRIGIDO
  async deleteUser(userId: string): Promise<void> {
    try {
      // Não permitir deletar o próprio usuário
      const currentUser = await this.getUser(userId);
      if (!currentUser) {
        throw new Error("Usuário não encontrado");
      }

      // Não permitir deletar super_admin
      if (currentUser.role === 'super_admin') {
        throw new Error("Não é possível deletar um Super Admin");
      }

      // 🔥 CORREÇÃO: Primeiro deletar registros relacionados
      console.log(`🗑️ Deletando registros relacionados do usuário: ${userId}`);
      
      // Deletar tokens de verificação de email
      try {
        await db.delete(emailVerificacoes).where(eq(emailVerificacoes.userId, userId));
        console.log(`✅ Tokens de verificação deletados para usuário: ${userId}`);
      } catch (emailError) {
        console.error(`⚠️ Erro ao deletar tokens de verificação:`, emailError);
      }

      // 🔥 ADICIONAR AQUI OUTRAS EXCLUSÕES SE NECESSÁRIO:
      // - Movimentações relacionadas ao usuário
      // - Inventários criados pelo usuário
      // - Relatórios gerados pelo usuário
      // - Importações feitas pelo usuário

      // Agora deletar o usuário
      await db.delete(users).where(eq(users.id, userId));
      console.log(`✅ Usuário ${userId} deletado com sucesso`);

    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      throw error;
    }
  }

  async canUserAccessModule(userId: string, module: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      // 🔥 DEFINIÇÃO DE PERMISSÕES POR ROLE
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
          usuarios: ['view', 'create', 'edit'], // Não pode deletar super_admin
          relatorios: ['view', 'create', 'export'],
          configuracoes: ['view'],
          importacao: ['view', 'create', 'delete'],
          movimentacoes: ['view', 'create', 'edit', 'delete'],
          inventarios: ['view', 'create', 'edit', 'delete']
        },
        'user': {
          produtos: ['view'],
          usuarios: [], // Sem acesso
          relatorios: ['view'],
          configuracoes: [], // Sem acesso
          importacao: ['view'],
          movimentacoes: ['view', 'create'],
          inventarios: ['view']
        }
      };

      const userPermissions = permissions[user.role as keyof typeof permissions];
      return userPermissions && module in userPermissions && userPermissions[module as keyof typeof userPermissions].length > 0;
    } catch (error) {
      console.error('❌ Erro ao verificar permissões:', error);
      return false;
    }
  }

  async getUserPermissions(userId: string): Promise<any> {
    try {
      const user = await this.getUser(userId);
      if (!user) return {};

      // 🔥 PERMISSÕES DETALHADAS
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
          usuarios: { view: true, create: true, edit: true }, // Não pode deletar
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
      console.error('❌ Erro ao buscar permissões do usuário:', error);
      return {};
    }
  }
}

export const storage = new DatabaseStorage();