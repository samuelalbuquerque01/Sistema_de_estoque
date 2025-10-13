// client/server/storage.ts - VERSÃO SEM DEBUG
import { type User, type InsertUser, type Product, type InsertProduct, type Category, type Location, type InsertCategory, type InsertLocation, type Movement, type InsertMovement, type Inventory, type InsertInventory, type InventoryCount, type InsertInventoryCount, type Report, type InsertReport } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, products, categories, locations, movements, inventories, inventoryCounts, reports } from "@shared/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Métodos existentes
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

  // MÉTODOS PARA RELATÓRIOS
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
}

export class DatabaseStorage implements IStorage {
  async ensureDefaultUser(): Promise<string> {
    try {
      const existingUser = await this.getUserByUsername('admin');
      if (existingUser) {
        return existingUser.id;
      }
      const defaultUser: InsertUser = {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        email: 'admin@stockmaster.com'
      };
      const user = await this.createUser(defaultUser);
      return user.id;
    } catch (error) {
      throw new Error('Erro ao criar usuário padrão');
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    await db.insert(users).values(user);
    return user;
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

      // Dados enriquecidos para relatório
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

      // Valor por categoria
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

      // Top 10 produtos mais valiosos
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

      // Filtrar por período se especificado
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
}

export const storage = new DatabaseStorage();