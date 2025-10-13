// client/server/routes.ts - VERSÃO CORRIGIDA
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertLocationSchema, insertMovementSchema, insertInventorySchema, insertUserSchema, insertInventoryCountSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";
import ReportService from "./utils/reportService";

// 🔥 FUNÇÃO AUXILIAR PARA CSV (fallback)
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

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
      if (password !== user.password) return res.status(401).json({ error: "Credenciais inválidas" });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ error: "Produto não encontrado" });
      res.json(product);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
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
      console.error("Erro ao criar produto:", error);
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
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
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
      console.error("Erro ao criar categoria:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      console.error("Erro ao buscar locais:", error);
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
      console.error("Erro ao criar local:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/movements", async (req, res) => {
    try {
      const movements = await storage.getMovements();
      res.json(movements);
    } catch (error) {
      console.error("Erro ao buscar movimentações:", error);
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
      console.error("Erro ao criar movimentação:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/inventories", async (req, res) => {
    try {
      const inventories = await storage.getInventories();
      res.json(inventories);
    } catch (error) {
      console.error("Erro ao buscar inventários:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/inventories/:id", async (req, res) => {
    try {
      console.log('🎯 GET /api/inventories/:id - ID:', req.params.id);
      const inventory = await storage.getInventory(req.params.id);
      if (!inventory) return res.status(404).json({ error: "Inventário não encontrado" });
      res.json(inventory);
    } catch (error) {
      console.error("Erro ao buscar inventário:", error);
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
      console.error("Erro ao criar inventário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/inventories/:id/finalize", async (req, res) => {
    try {
      const inventory = await storage.finalizeInventory(req.params.id);
      res.json(inventory);
    } catch (error) {
      console.error("Erro ao finalizar inventário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/inventories/:id/reopen", async (req, res) => {
    try {
      console.log('🎯 PUT /api/inventories/:id/reopen - ID:', req.params.id);
      const inventory = await storage.reopenInventory(req.params.id);
      res.json(inventory);
    } catch (error) {
      console.error("Erro ao reabrir inventário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/inventories/:id/counts", async (req, res) => {
    try {
      console.log('🎯 GET /api/inventories/:id/counts - ID:', req.params.id);
      const counts = await storage.getInventoryCounts(req.params.id);
      res.json(counts);
    } catch (error) {
      console.error("Erro ao buscar contagens:", error);
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
      console.error("Erro ao criar contagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 🔥 ROTAS DE RELATÓRIOS CORRIGIDAS

  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { reportType, format, period, startDate, endDate } = req.body;
      
      console.log(`📊 Recebida solicitação de relatório: ${reportType}, formato: ${format}`);
      
      if (!reportType || !format) {
        return res.status(400).json({ error: "Tipo de relatório e formato são obrigatórios" });
      }

      let reportData: any;
      let filters = {};

      // 🔥 OBTER DADOS DO RELATÓRIO - CORRIGIDO
      try {
        switch (reportType) {
          case 'Produtos':
            console.log('📊 Gerando relatório de produtos...');
            reportData = await storage.getProductsReport();
            break;

          case 'Estoque Baixo':
            console.log('📊 Gerando relatório de estoque baixo...');
            reportData = await storage.getLowStockProducts();
            break;

          case 'Valor Estoque':
            console.log('📊 Gerando relatório financeiro...');
            reportData = await storage.getFinancialReport();
            break;

          case 'Movimentações':
            console.log('📊 Gerando relatório de movimentações...');
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
            console.log('📊 Gerando relatório de inventários...');
            reportData = await storage.getInventoryReport();
            break;

          case 'Produtos por Local':
            console.log('📊 Gerando relatório de produtos por local...');
            reportData = await storage.getProductsByLocationReport();
            break;

          default:
            return res.status(400).json({ error: "Tipo de relatório inválido" });
        }

        console.log(`📊 Dados do relatório gerados com sucesso:`, {
          tipo: reportType,
          temDados: !!reportData,
          estrutura: Object.keys(reportData || {})
        });

      } catch (reportError) {
        console.error(`❌ Erro ao gerar dados do relatório ${reportType}:`, reportError);
        return res.status(500).json({ error: `Erro ao gerar dados do relatório: ${reportError}` });
      }

      // 🔥 VERIFICAR SE HÁ DADOS
      if (!reportData) {
        return res.status(500).json({ error: "Nenhum dado foi gerado para o relatório" });
      }

      // 🔥 GERAR ARQUIVO PROFISSIONAL
      let fileBuffer: Buffer;
      let mimeType: string;
      let fileExtension: string;

      try {
        if (format === 'excel') {
          console.log('📊 Gerando arquivo Excel...');
          fileBuffer = await ReportService.generateExcelReport(reportData, reportType);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileExtension = 'xlsx';
        } else if (format === 'pdf') {
          console.log('📊 Gerando arquivo PDF...');
          fileBuffer = await ReportService.generatePDFReport(reportData, reportType);
          mimeType = 'application/pdf';
          fileExtension = 'pdf';
        } else {
          console.log('📊 Gerando arquivo CSV...');
          // Para CSV, usar dados estruturados
          const csvData = reportData.produtos || reportData.movimentacoes || reportData.inventarios || reportData.produtos_por_local || [reportData];
          const csvContent = convertToCSV(csvData);
          fileBuffer = Buffer.from(csvContent, 'utf-8');
          mimeType = 'text/csv';
          fileExtension = 'csv';
        }

        console.log(`📊 Arquivo ${format} gerado com sucesso, tamanho: ${fileBuffer.length} bytes`);

      } catch (fileError) {
        console.error(`❌ Erro ao gerar arquivo ${format}:`, fileError);
        // Fallback para CSV simples
        const csvData = reportData.produtos || reportData.movimentacoes || reportData.inventarios || reportData.produtos_por_local || [reportData];
        const csvContent = convertToCSV(csvData);
        fileBuffer = Buffer.from(csvContent, 'utf-8');
        mimeType = 'text/csv';
        fileExtension = 'csv';
      }

      // Salvar registro do relatório
      try {
        const reportRecord = await storage.createReport({
          name: `${reportType} - ${new Date().toLocaleDateString('pt-BR')}`,
          type: reportType.toLowerCase().replace(/\s+/g, '_'),
          format,
          filters,
          generatedBy: null,
          filePath: null
        });
        console.log('📊 Registro do relatório salvo com sucesso');
      } catch (reportSaveError) {
        console.error('❌ Erro ao salvar registro do relatório:', reportSaveError);
        // Não falhar se apenas o registro falhar
      }

      // 🔥 CONFIGURAR DOWNLOAD DO ARQUIVO
      const filename = `relatorio_${reportType.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      // 🔥 ENVIAR ARQUIVO REAL
      console.log(`📊 Enviando arquivo para download: ${filename}`);
      res.send(fileBuffer);

    } catch (error) {
      console.error("❌ Erro geral ao gerar relatório:", error);
      res.status(500).json({ error: "Erro interno do servidor ao gerar relatório" });
    }
  });

  app.get("/api/reports/download/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Relatório não encontrado" });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${report.name}_${report.createdAt?.toISOString().split('T')[0]}.json"`);
      
      res.json({
        message: "Relatório registrado - Use a geração para obter arquivos formatados",
        report: report
      });

    } catch (error) {
      console.error("Erro ao fazer download do relatório:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      await storage.deleteReport(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
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

      res.json({
        totalReports,
        reportsByType,
        reportsByFormat,
        lastGenerated: reports[0]?.createdAt || null
      });

    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}