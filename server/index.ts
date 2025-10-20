// server/index.ts - VERSÃO FINAL CORRIGIDA
import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Iniciando StockMaster Server...');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { registerRoutes } from './routes';
import path from 'path';

const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet());

// ✅ Registrar rotas da API PRIMEIRO
console.log('📡 Registrando rotas da API...');
registerRoutes(app);

// ✅ Servir arquivos estáticos do build do Vite
const staticPath = path.join(process.cwd(), 'dist', 'public');
console.log('📁 Servindo arquivos estáticos de:', staticPath);
app.use(express.static(staticPath));

// ✅ Rota fallback para SPA - APENAS para rotas que não são API
app.get('*', (req, res) => {
  // Se a rota começa com /api, retorna 404 para API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'Endpoint da API não encontrado',
      path: req.path 
    });
  }
  
  // Para todas as outras rotas, serve o SPA
  console.log('📄 Servindo SPA para rota:', req.path);
  res.sendFile(path.join(staticPath, 'index.html'));
});

const port = parseInt(process.env.PORT || '5000', 10);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(port, host, () => {
  console.log('🚀 StockMaster server running on http://' + host + ':' + port);
  console.log('📊 Environment:', process.env.NODE_ENV);
  console.log('🌐 Health check: http://' + host + ':' + port + '/api/health');
  console.log('📁 Static files from:', staticPath);
});

export default app;