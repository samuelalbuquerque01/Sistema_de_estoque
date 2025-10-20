// server/index.ts - VERSÃO COMPLETA CORRIGIDA
import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Iniciando StockMaster Server...');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { registerRoutes } from './routes';

const app = express();

// Middlewares PRIMEIRO
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet());

// Registrar todas as rotas da API ANTES do static
console.log('📡 Registrando rotas da API...');
registerRoutes(app);

// Servir arquivos estáticos do Vite (DEPOIS das rotas da API)
app.use(express.static('dist/public'));

// Rota fallback para SPA (DEVE SER A ÚLTIMA)
app.get('*', (req, res) => {
  console.log('📄 Servindo SPA para rota:', req.path);
  res.sendFile(process.cwd() + '/dist/public/index.html');
});

const port = parseInt(process.env.PORT || '5000', 10);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(port, host, () => {
  console.log('🚀 StockMaster server running on http://' + host + ':' + port);
  console.log('📊 Environment:', process.env.NODE_ENV);
  console.log('🌐 Health check available at /api/health');
  console.log('📁 Static files from:', process.cwd() + '/dist/public');
});

export default app;