// server/index.ts - Versão simplificada
import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Iniciando StockMaster Server...');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());

// Health Check
app.get('/api/health', async (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: "1.0.0"
  });
});

// Rota principal da API
app.get('/api', (req, res) => {
  res.json({
    message: "StockMaster API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Servir arquivos estáticos do Vite
app.use(express.static('dist/public'));

// Rota fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(process.cwd() + '/dist/public/index.html');
});

const port = parseInt(process.env.PORT || '5000', 10);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(port, host, () => {
  console.log('🚀 StockMaster server running on http://' + host + ':' + port);
  console.log('📊 Environment:', process.env.NODE_ENV);
  console.log('🌐 Health check available at /api/health');
});