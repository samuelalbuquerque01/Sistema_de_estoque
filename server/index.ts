// ✅ CORREÇÃO CRÍTICA PARA RENDER - VERSÃO ATUALIZADA
// MOVER dotenv para DENTRO da função async

// SEU CÓDIGO ATUAL - REMOVER dotenv do topo
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// ✅ ADICIONE ESTA IMPORTACAO
import { migrate } from "./migrate";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // ✅ CARREGAR DOTENV DENTRO DA FUNÇÃO ASYNC
    const dotenv = await import('dotenv');
    dotenv.config();

    console.log('🚀 Iniciando StockMaster Server...');
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'Não configurada');

    // DEBUG: Verificar se o arquivo está sendo executado
    console.log('🔍 DEBUG: server/index.ts started executing');
    console.log('🔍 DEBUG: Current directory:', process.cwd());
    console.log('🔍 DEBUG: NODE_ENV:', process.env.NODE_ENV);

    // ✅ EXECUTAR MIGRAÇÃO ANTES DE INICIAR
    console.log('🔄 Iniciando migração do banco de dados...');
    await migrate();
    console.log('✅ Migração do banco de dados concluída!');

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('❌ Erro não tratado:', err);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ✅ CORREÇÃO PARA RENDER - usar 0.0.0.0 em produção
    const port = parseInt(process.env.PORT || '5000', 10);
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

    server.listen(port, host, () => {
      log(`🚀 StockMaster server running on http://${host}:${port}`);
      log(`📊 Environment: ${process.env.NODE_ENV}`);
      log(`🌐 Health check available at /api/health`);
      log(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Local'}`);
    });
  } catch (error) {
    console.error('❌ Erro crítico ao iniciar servidor:', error);
    process.exit(1);
  }
})();