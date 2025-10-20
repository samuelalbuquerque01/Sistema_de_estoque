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
    // Dependências do PostgreSQL
    'pg',
    'bcrypt', 
    'pg-native',
    '@neondatabase/serverless',
    
    // Dependências do Babel (causavam erro)
    '@babel/*',
    
    // Dependências do LightningCSS (causavam erro)
    'lightningcss',
    '../pkg',
    '../lightningcss.*.node',
    
    // Outras dependências que não devem ser incluídas
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
  logLevel: 'info'
};

try {
  await esbuild.build(buildOptions);
  console.log('✅ Build do servidor concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build do servidor:', error);
  process.exit(1);
}