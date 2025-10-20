// server/shims.js - Shims para compatibilidade ESM
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Exportar para uso global no bundle
export { require, __filename, __dirname };