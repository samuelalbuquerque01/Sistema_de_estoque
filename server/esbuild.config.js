// server/esbuild.config.js
import esbuild from 'esbuild';

const buildOptions = {
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  packages: 'external',
  external: [
    // Dependências do Node.js
    'fs',
    'path',
    'crypto',
    'http',
    'https',
    'url',
    'util',
    'stream',
    'buffer',
    'os',
    'net',
    'tls',
    'zlib',
    'events',
    
    // Dependências do PostgreSQL
    'pg',
    'bcrypt', 
    'pg-native',
    '@neondatabase/serverless',
    
    // Dependências do Babel
    '@babel/*',
    
    // Dependências do LightningCSS
    'lightningcss',
    '../pkg',
    '../lightningcss.*.node',
    
    // Outras dependências
    'express',
    'drizzle-orm',
    'postgres',
    'dotenv',
    'xml2js',
    'multer',
    'nodemailer',
    'pdfkit',
    'exceljs',
    'ws',
    'connect-pg-simple',
    'express-session',
    'memorystore',
    'passport',
    'passport-local'
  ],
  sourcemap: false,
  minify: true,
  logLevel: 'info',
  // Configurações importantes para ESM
  mainFields: ['module', 'main'],
  conditions: ['module', 'import', 'require'],
  inject: ['./server/shims.js'] // Adicionar shims para require
};

try {
  await esbuild.build(buildOptions);
  console.log('✅ Build do servidor concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build do servidor:', error);
  process.exit(1);
}