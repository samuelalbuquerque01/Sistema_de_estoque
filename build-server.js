// build-server.js - Script de build para o servidor
import esbuild from 'esbuild';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

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
    'fs', 'path', 'crypto', 'http', 'https', 'url', 'util', 'stream', 'buffer', 'os', 'net', 'tls', 'zlib', 'events',
    // Dependências do PostgreSQL
    'pg', 'bcrypt', 'pg-native', '@neondatabase/serverless',
    // Outras dependências
    'express', 'drizzle-orm', 'postgres', 'dotenv', 'xml2js', 'multer', 'nodemailer', 'pdfkit', 'exceljs',
    'cors', 'helmet', 'axios'
  ],
  sourcemap: false,
  minify: true,
  logLevel: 'info',
  mainFields: ['module', 'main'],
  conditions: ['module', 'import', 'require'],
};

try {
  await esbuild.build(buildOptions);
  console.log('✅ Build do servidor concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build do servidor:', error);
  process.exit(1);
}