// server/routes.ts - VERSÃO LIMPA ATUALIZADA
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, insertCategorySchema, insertLocationSchema, 
  insertMovementSchema, insertInventorySchema, insertUserSchema, 
  insertInventoryCountSchema, insertReportSchema,
  cadastroUsuarioSchema, cadastroEmpresaSchema, verificarEmailSchema
} from "@shared/schema";
import { z } from "zod";
import ReportService from "./utils/reportService";
import { importRoutes } from "./routes/import";
import { invoiceRoutes } from "./routes/invoices";
import { randomUUID } from "crypto";
import { EmailService } from "./utils/EmailService";

function convertToCSV(data: any): string {
  if (!data) return '';
  let csvContent = '';
  
  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0]).join(';');
    const rows = data.map(row => 
      Object.values(row).map(value => {
        const strValue = String(value || '');
        return `"${strValue.replace(/"/g, '""')}"`;
      }).join(';')
    ).join('\n');
    csvContent = `${headers}\n${rows}`;
  } else if (typeof data === 'object') {
    const sections = [];
    sections.push('RELATÓRIO GERADO EM;' + new Date().toLocaleString('pt-BR'));
    sections.push('');
    
    if (data.summary && typeof data.summary === 'object') {
      sections.push('RESUMO');
      sections.push(Object.keys(data.summary).join(';'));
      sections.push(Object.values(data.summary).map(v => `"${v}"`).join(';'));
      sections.push('');
    }
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      sections.push('DADOS');
      const headers = Object.keys(data.data[0]).join(';');
      sections.push(headers);
      data.data.forEach(row => {
        const rowValues = Object.values(row).map(value => 
          `"${String(value || '').replace(/"/g, '""')}"`
        ).join(';');
        sections.push(rowValues);
      });
    } else {
      sections.push('DADOS');
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'summary' && key !== 'data') {
          sections.push(`${key};"${String(value).replace(/"/g, '""')}"`);
        }
      });
    }
    
    csvContent = sections.join('\n');
  }
  
  return csvContent;
}

function sendXmlResponse(res: any, nfeData: any, importItem: any) {
  const xmlContent = nfeData.xmlContent;
  const fileName = importItem 
    ? `nfe_${importItem.nfeKey || importItem.id}.xml`
    : `nfe_${nfeData.accessKey || nfeData.id}.xml`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', Buffer.byteLength(xmlContent, 'utf8'));
  res.send(xmlContent);
}

export async function registerRoutes(app: Express): Promise<Server> {
  EmailService.initialize();
  
  // Inicializar categorias padrão
  try {
    await storage.ensureDefaultCategories();
    console.log('✅ Categorias padrão inicializadas');
  } catch (error) {
    console.error('❌ Erro ao inicializar categorias:', error);
  }

  // Inicializar usuário admin
  try {
    await storage.ensureDefaultUser();
    console.log('✅ Usuário admin inicializado');
  } catch (error) {
    console.error('❌ Erro ao inicializar usuário admin:', error);
  }
  
  app.use("/api/import", importRoutes);
  app.use("/api/invoices", invoiceRoutes);

  // Rotas de inicialização
  app.post("/api/init/categories", async (req, res) => {
    try {
      await storage.ensureDefaultCategories();
      const categories = await storage.getCategories();
      res.json({ 
        success: true, 
        message: "Categorias inicializadas com sucesso",
        categories 
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Erro ao inicializar categorias",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.get("/api/init/check", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      const users = await storage.getUsers();
      
      res.json({
        categories: {
          count: categories.length,
          items: categories
        },
        users: {
          count: users.length,
          hasAdmin: users.some(u => u.email === 'admin@stockmaster.com')
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao verificar inicialização" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email e senha são obrigatórios",
          message: "Preencha todos os campos"
        });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ 
          error: "Credenciais inválidas",
          message: "Email ou senha incorretos"
        });
      }

      if (password !== user.password) {
        return res.status(401).json({ 
          error: "Credenciais inválidas",
          message: "Email ou senha incorretos"
        });
      }
      
      if (!user.emailVerificado) {
        return res.status(401).json({ 
          error: "Email não verificado",
          message: "Verifique seu email antes de fazer login",
          needsVerification: true,
          email: user.email
        });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        ...userWithoutPassword,
        message: "Login realizado com sucesso"
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.post("/api/auth/cadastro/usuario", async (req, res) => {
    try {
      const validatedData = cadastroUsuarioSchema.parse(req.body);
      
      const resultado = await storage.cadastrarUsuarioIndividual(validatedData);
      
      if (resultado.user.email !== 'admin@stockmaster.com') {
        await EmailService.enviarEmailVerificacao(
          resultado.user.email,
          resultado.user.name,
          resultado.token
        );
      }

      res.status(201).json({
        success: true,
        message: "Cadastro realizado com sucesso! " + 
          (resultado.user.email !== 'admin@stockmaster.com' 
            ? "Verifique seu email para ativar a conta." 
            : "Conta de administrador criada."),
        user: {
          id: resultado.user.id,
          name: resultado.user.name,
          email: resultado.user.email,
          emailVerificado: resultado.user.emailVerificado
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      }
      
      res.status(400).json({ 
        error: "Erro no cadastro",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.post("/api/auth/cadastro/empresa", async (req, res) => {
    try {
      const validatedData = cadastroEmpresaSchema.parse(req.body);
      
      const resultado = await storage.cadastrarEmpresa(validatedData);
      
      await EmailService.enviarEmailVerificacao(
        resultado.admin.email,
        resultado.admin.name,
        resultado.token
      );

      res.status(201).json({
        success: true,
        message: "Empresa cadastrada com sucesso! Verifique seu email para ativar a conta do administrador.",
        empresa: {
          id: resultado.empresa.id,
          nome: resultado.empresa.nome,
          cnpj: resultado.empresa.cnpj
        },
        admin: {
          id: resultado.admin.id,
          name: resultado.admin.name,
          email: resultado.admin.email
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      }
      
      res.status(400).json({ 
        error: "Erro no cadastro",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.post("/api/auth/verificar-email", async (req, res) => {
    try {
      const { token } = verificarEmailSchema.parse(req.body);
      
      if (token === 'admin-auto-verified') {
        return res.json({
          success: true,
          message: "Email verificado automaticamente (admin)",
          user: {
            id: 'admin',
            name: 'Administrador',
            email: 'admin@stockmaster.com',
            emailVerificado: true
          }
        });
      }
      
      const verificacao = await storage.getEmailVerificacao(token);
      
      if (!verificacao) {
        return res.status(400).json({ 
          error: "Token inválido ou expirado" 
        });
      }

      if (verificacao.utilizado) {
        return res.status(400).json({ 
          error: "Token já utilizado" 
        });
      }

      if (new Date() > verificacao.expiraEm) {
        return res.status(400).json({ 
          error: "Token expirado" 
        });
      }

      const user = await storage.marcarEmailComoVerificado(verificacao.userId);
      await storage.utilizarTokenVerificacao(token);

      await EmailService.enviarEmailBoasVindas(user.email, user.name);

      res.json({
        success: true,
        message: "Email verificado com sucesso!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerificado: user.emailVerificado
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Token inválido", 
          details: error.errors 
        });
      }
      
      res.status(400).json({ 
        error: "Erro na verificação",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.post("/api/auth/reenviar-verificacao", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      if (user.emailVerificado) {
        return res.status(400).json({ error: "Email já verificado" });
      }

      const token = randomUUID();
      await storage.createEmailVerificacao({
        userId: user.id,
        email: user.email,
        token,
        tipo: 'cadastro'
      });

      await EmailService.enviarEmailVerificacao(user.email, user.name, token);

      res.json({
        success: true,
        message: "Email de verificação reenviado com sucesso!"
      });

    } catch (error) {
      res.status(500).json({ 
        error: "Erro interno do servidor" 
      });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const movements = await storage.getMovements();
      const categories = await storage.getCategories();
      const locations = await storage.getLocations();

      const totalProducts = products.length;
      const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity);
      const outOfStockProducts = products.filter(p => p.quantity === 0);
      
      const totalValue = products.reduce((sum, product) => {
        let price = parseFloat(product.unitPrice?.toString() || '0');
        
        if (price > 1000) {
          price = price / 100;
        }
        
        return sum + (price * product.quantity);
      }, 0);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const todayMovements = movements.filter(m => new Date(m.createdAt) >= today);
      const weekMovements = movements.filter(m => new Date(m.createdAt) >= weekAgo);
      const monthMovements = movements.filter(m => new Date(m.createdAt) >= monthAgo);

      const movementStats = {
        today: todayMovements.length,
        week: weekMovements.length,
        month: monthMovements.length,
        entrada: movements.filter(m => m.type === 'entrada').length,
        saida: movements.filter(m => m.type === 'saida').length
      };

      const categorySummary = categories.map(category => {
        const categoryProducts = products.filter(p => p.categoryId === category.id);
        const categoryValue = categoryProducts.reduce((sum, product) => {
          let price = parseFloat(product.unitPrice?.toString() || '0');
          if (price > 1000) price = price / 100;
          return sum + (price * product.quantity);
        }, 0);

        return {
          id: category.id,
          name: category.name,
          count: categoryProducts.length,
          value: categoryValue
        };
      }).filter(cat => cat.count > 0).sort((a, b) => b.value - a.value);

      const locationSummary = locations.map(location => {
        const locationProducts = products.filter(p => p.locationId === location.id);
        const locationValue = locationProducts.reduce((sum, product) => {
          let price = parseFloat(product.unitPrice?.toString() || '0');
          if (price > 1000) price = price / 100;
          return sum + (price * product.quantity);
        }, 0);

        return {
          id: location.id,
          name: location.name,
          productCount: locationProducts.length,
          totalValue: locationValue
        };
      }).filter(loc => loc.productCount > 0).sort((a, b) => b.totalValue - a.totalValue);

      const criticalProducts = [...outOfStockProducts, ...lowStockProducts]
        .sort((a, b) => {
          if (a.quantity === 0 && b.quantity > 0) return -1;
          if (b.quantity === 0 && a.quantity > 0) return 1;
          return (a.quantity / a.minQuantity) - (b.quantity / b.minQuantity);
        })
        .slice(0, 10)
        .map(product => ({
          product: {
            id: product.id,
            code: product.code || 'N/A',
            name: product.name,
            quantity: product.quantity,
            minQuantity: product.minQuantity,
            unitPrice: product.unitPrice?.toString() || '0'
          },
          urgency: product.quantity === 0 ? 'critical' : 'warning',
          message: product.quantity === 0 ? 'Produto sem estoque' : `Estoque baixo (${product.quantity}/${product.minQuantity})`
        }));

      const chartData = categorySummary.slice(0, 6).map(category => {
        const categoryMovements = movements.filter(m => {
          const movementProduct = products.find(p => p.id === m.productId);
          return movementProduct?.categoryId === category.id;
        });

        return {
          name: category.name,
          entrada: categoryMovements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0),
          saida: categoryMovements.filter(m => m.type === 'saida').reduce((sum, m) => sum + m.quantity, 0),
        };
      });

      const recentMovements = movements
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
        .map(movement => {
          const product = products.find(p => p.id === movement.productId);
          return {
            id: movement.id,
            productId: movement.productId,
            type: movement.type,
            quantity: movement.quantity,
            userId: movement.userId,
            notes: movement.notes,
            createdAt: movement.createdAt,
            productName: product?.name || 'Produto não encontrado',
            user: 'Sistema'
          };
        });

      const dashboardData = {
        totalProducts,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        totalValue: parseFloat(totalValue.toFixed(2)),
        movements: movements.length,
        movementStats,
        recentMovements,
        criticalProducts,
        chartData,
        categories: categorySummary,
        locations: locationSummary
      };

      res.json(dashboardData);

    } catch (error) {
      res.status(500).json({ 
        error: "Erro interno do servidor ao carregar dashboard",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.get("/api/import/history", async (req, res) => {
    try {
      const importHistory = await storage.getImportHistory();
      const formattedHistory = importHistory.map(item => ({
        id: item.id,
        fileName: item.fileName,
        status: item.status,
        productsFound: item.productsFound || 0,
        productsCreated: item.productsCreated || 0,
        productsUpdated: item.productsUpdated || 0,
        supplier: {
          name: item.supplier || 'Fornecedor não identificado',
          cnpj: item.supplierCnpj || '00.000.000/0001-00',
          address: item.supplierAddress || ''
        },
        nfeData: {
          number: item.nfeNumber || '000001',
          key: item.nfeKey || '',
          emissionDate: item.emissionDate || item.createdAt,
          totalValue: item.totalValue || 0,
          xmlContent: item.xmlContent
        },
        importDate: item.createdAt,
        processedAt: item.processedAt,
        errorMessage: item.errorMessage,
        userId: item.userId
      }));
      res.json(formattedHistory);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/import/:id/products", async (req, res) => {
    try {
      const { id } = req.params;
      const nfeProducts = await storage.getNfeProductsByImport(id);
      const formattedProducts = nfeProducts.map(product => ({
        id: product.id,
        code: product.nfeCode || product.code || 'N/A',
        name: product.name || 'Produto não identificado',
        quantity: product.quantity || 0,
        unitPrice: parseFloat(product.unitPrice?.toString() || '0'),
        unit: product.unit || 'UN',
        totalValue: parseFloat(product.totalValue?.toString() || '0'),
        nfeData: product.nfeData
      }));
      res.json(formattedProducts);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/import/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      
      const nfeData = await storage.getNfeDataByImport(id);
      
      if (!nfeData) {
        const importItem = await storage.getImportHistoryById(id);
        if (!importItem) {
          return res.status(404).json({ error: "Importação não encontrada" });
        }
        
        if (importItem.nfeKey) {
          const nfeByKey = await storage.getNfeDataByAccessKey(importItem.nfeKey);
          if (nfeByKey) {
            return sendXmlResponse(res, nfeByKey, importItem);
          }
        }
        
        return res.status(404).json({ error: "XML não encontrado para esta importação" });
      }

      if (!nfeData.xmlContent) {
        return res.status(404).json({ error: "Conteúdo XML não disponível" });
      }

      return sendXmlResponse(res, nfeData, null);

    } catch (error) {
      res.status(500).json({ 
        error: "Erro interno do servidor ao buscar XML",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.post("/api/import/:id/reprocess", async (req, res) => {
    try {
      const { id } = req.params;
      const importItem = await storage.getImportHistoryById(id);
      if (!importItem) return res.status(404).json({ error: "Importação não encontrada" });
      
      await storage.updateImportHistory(id, { status: 'processando', errorMessage: null });

      setTimeout(async () => {
        try {
          const nfeProducts = await storage.getNfeProductsByImport(id);
          await storage.updateImportHistory(id, {
            status: 'processado',
            productsFound: nfeProducts.length,
            productsCreated: nfeProducts.length,
            processedAt: new Date()
          });
        } catch (error) {
          await storage.updateImportHistory(id, {
            status: 'erro',
            errorMessage: 'Erro no reprocessamento'
          });
        }
      }, 2000);

      res.json({ success: true, message: "Reprocessamento iniciado", importId: id });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/import/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const importItem = await storage.getImportHistoryById(id);
      if (!importItem) {
        return res.status(404).json({ error: "Importação não encontrada" });
      }
      
      await storage.deleteImportHistory(id);
      
      res.json({ 
        success: true, 
        message: "Importação excluída permanentemente", 
        importId: id 
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Erro interno do servidor ao excluir importação",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ error: "Produto não encontrado" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteProduct(id);
      
      res.status(204).send();
      
    } catch (error) {
      res.status(500).json({ 
        error: "Erro interno do servidor ao excluir produto",
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: "O produto pode estar vinculado a movimentações, inventários ou outros registros"
      });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/locations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const validatedData = insertLocationSchema.partial().parse(req.body);
      
      const location = await storage.updateLocation(id, validatedData);
      
      res.json(location);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Erro interno do servidor ao atualizar local",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteLocation(id);
      
      res.status(204).send();
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('produtos vinculados')) {
          return res.status(400).json({ 
            error: "Não é possível excluir o local",
            message: error.message
          });
        } else if (error.message.includes('não encontrado')) {
          return res.status(404).json({ 
            error: "Local não encontrado",
            message: error.message
          });
        }
      }
      
      res.status(500).json({ 
        error: "Erro interno do servidor ao excluir local",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.get("/api/movements", async (req, res) => {
    try {
      const movements = await storage.getMovements();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/movements", async (req, res) => {
    try {
      const validatedData = insertMovementSchema.parse(req.body);
      const movement = await storage.createMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/inventories", async (req, res) => {
    try {
      const inventories = await storage.getInventories();
      res.json(inventories);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/inventories/:id", async (req, res) => {
    try {
      const inventory = await storage.getInventory(req.params.id);
      if (!inventory) return res.status(404).json({ error: "Inventário não encontrado" });
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/inventories", async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const inventory = await storage.createInventory(validatedData);
      res.status(201).json(inventory);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/inventories/:id/finalize", async (req, res) => {
    try {
      const inventory = await storage.finalizeInventory(req.params.id);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/inventories/:id/reopen", async (req, res) => {
    try {
      const inventory = await storage.reopenInventory(req.params.id);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/inventories/:id/counts", async (req, res) => {
    try {
      const counts = await storage.getInventoryCounts(req.params.id);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/inventories/:id/counts", async (req, res) => {
    try {
      const validatedData = insertInventoryCountSchema.parse({ ...req.body, inventoryId: req.params.id });
      const count = await storage.createInventoryCount(validatedData);
      res.status(201).json(count);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { reportType, format, period, startDate, endDate } = req.body;
      if (!reportType || !format) return res.status(400).json({ error: "Tipo de relatório e formato são obrigatórios" });

      let reportData: any;
      let filters = {};

      switch (reportType) {
        case 'Produtos':
          reportData = await storage.getProductsReport();
          break;
        case 'Estoque Baixo':
          reportData = await storage.getLowStockProducts();
          break;
        case 'Valor Estoque':
          reportData = await storage.getFinancialReport();
          break;
        case 'Movimentações':
          let movementsStartDate, movementsEndDate;
          if (period && period !== 'all') {
            movementsEndDate = new Date();
            movementsStartDate = new Date();
            movementsStartDate.setDate(movementsStartDate.getDate() - parseInt(period));
            filters = { period };
          } else if (startDate && endDate) {
            movementsStartDate = new Date(startDate);
            movementsEndDate = new Date(endDate);
            filters = { startDate, endDate };
          }
          reportData = await storage.getMovementsReport(movementsStartDate, movementsEndDate);
          break;
        case 'Inventários':
          reportData = await storage.getInventoryReport();
          break;
        case 'Produtos por Local':
          reportData = await storage.getProductsByLocationReport();
          break;
        default:
          return res.status(400).json({ error: "Tipo de relatório inválido" });
      }

      if (!reportData) return res.status(500).json({ error: "Nenhum dado foi gerado para o relatório" });

      let fileBuffer: Buffer;
      let mimeType: string;
      let fileExtension: string;

      try {
        if (format === 'excel') {
          fileBuffer = await ReportService.generateExcelReport(reportData, reportType);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileExtension = 'xlsx';
        } else if (format === 'pdf') {
          fileBuffer = await ReportService.generatePDFReport(reportData, reportType);
          mimeType = 'application/pdf';
          fileExtension = 'pdf';
        } else {
          const csvData = reportData.produtos || reportData.movimentacoes || reportData.inventarios || reportData.produtos_por_local || [reportData];
          const csvContent = convertToCSV(csvData);
          fileBuffer = Buffer.from(csvContent, 'utf-8');
          mimeType = 'text/csv';
          fileExtension = 'csv';
        }
      } catch (fileError) {
        const csvData = reportData.produtos || reportData.movimentacoes || reportData.inventarios || reportData.produtos_por_local || [reportData];
        const csvContent = convertToCSV(csvData);
        fileBuffer = Buffer.from(csvContent, 'utf-8');
        mimeType = 'text/csv';
        fileExtension = 'csv';
      }

      try {
        await storage.createReport({
          name: `${reportType} - ${new Date().toLocaleDateString('pt-BR')}`,
          type: reportType.toLowerCase().replace(/\s+/g, '_'),
          format,
          filters,
          generatedBy: null,
          filePath: null
        });
      } catch (reportSaveError) {
      }

      const filename = `relatorio_${reportType.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      res.send(fileBuffer);

    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor ao gerar relatório" });
    }
  });

  app.get("/api/reports/download/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) return res.status(404).json({ error: "Relatório não encontrado" });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${report.name}_${report.createdAt?.toISOString().split('T')[0]}.json"`);
      res.json({ message: "Relatório registrado", report: report });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      await storage.deleteReport(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/reports/stats", async (req, res) => {
    try {
      const reports = await storage.getReports();
      const totalReports = reports.length;
      const reportsByType = reports.reduce((acc, report) => {
        acc[report.type] = (acc[report.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const reportsByFormat = reports.reduce((acc, report) => {
        acc[report.format] = (acc[report.format] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const recentReports = reports
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(report => ({
          id: report.id,
          name: report.name,
          type: report.type,
          format: report.format,
          createdAt: report.createdAt,
          generatedBy: report.generatedBy
        }));

      res.json({
        totalReports,
        reportsByType,
        reportsByFormat,
        recentReports
      });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/usuarios", async (req, res) => {
    try {
      const usuarios = await storage.getUsers();
      
      const usuariosSemSenha = usuarios.map(u => {
        const { password, tokenVerificacao, ...usuarioSemSenha } = u;
        return usuarioSemSenha;
      });

      res.json(usuariosSemSenha);
      
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/usuarios", async (req, res) => {
    try {
      const { name, email, role, password } = req.body;

      if (!name || !email || !role || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      const usuarioExistente = await storage.getUserByEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ error: "Já existe um usuário com este email" });
      }

      const baseUsername = name.toLowerCase().replace(/\s+/g, '.');
      let username = baseUsername;
      let counter = 1;
      
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
        if (counter > 10) break;
      }

      const novoUsuario = await storage.createUser({
        username,
        password,
        name,
        email,
        tipo: 'individual',
        role: role as 'admin' | 'user',
        emailVerificado: false
      });

      const token = randomUUID();
      await storage.createEmailVerificacao({
        userId: novoUsuario.id,
        email: novoUsuario.email,
        token,
        tipo: 'cadastro'
      });

      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso!",
        user: {
          id: novoUsuario.id,
          name: novoUsuario.name,
          email: novoUsuario.email,
          role: novoUsuario.role
        }
      });

    } catch (error) {
      res.status(400).json({ 
        error: "Erro ao criar usuário",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.put("/api/usuarios/:id/role", async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['super_admin', 'admin', 'user'].includes(role)) {
        return res.status(400).json({ error: "Role inválida" });
      }

      const usuarioAtualizado = await storage.updateUserRole(id, role as 'super_admin' | 'admin' | 'user');
      
      res.json({
        success: true,
        message: "Permissão atualizada com sucesso",
        user: usuarioAtualizado
      });

    } catch (error) {
      res.status(400).json({ 
        error: "Erro ao atualizar permissão",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.delete("/api/usuarios/:id", async (req, res) => {
    try {
      const { id } = req.params;

      await storage.deleteUser(id);
      
      res.json({
        success: true,
        message: "Usuário deletado com sucesso"
      });

    } catch (error) {
      res.status(400).json({ 
        error: "Erro ao deletar usuário",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.get("/api/usuarios/empresa/:empresaId", async (req, res) => {
    try {
      const { empresaId } = req.params;
      
      const usuarios = await storage.getUsersByEmpresa(empresaId);
      
      const usuariosSemSenha = usuarios.map(u => {
        const { password, tokenVerificacao, ...usuarioSemSenha } = u;
        return usuarioSemSenha;
      });

      res.json(usuariosSemSenha);
      
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}