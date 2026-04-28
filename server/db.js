"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var schema = require("../shared/schema.js");
var localFallbackUrl = "postgresql://postgres:postgres@localhost:5432/neuropsicocentro";
var databaseUrl = process.env.DATABASE_URL ||
    (process.env.NODE_ENV !== "production" ? localFallbackUrl : undefined);
if (!databaseUrl) {
    throw new Error("DATABASE_URL nao configurada.");
}
console.log('🗄️ Database URL configured (host:', ((_a = databaseUrl.split('@')[1]) === null || _a === void 0 ? void 0 : _a.split(':')[0]) || 'unknown', ')');
var isLocalDatabase = /(localhost|127\.0\.0\.1)/i.test(databaseUrl);
var isSupabasePooler = databaseUrl.includes("pooler.supabase.com") || /:6543(?:\/|\?)/.test(databaseUrl);
console.log('🌐 Connection mode:', isSupabasePooler ? 'Supabase Pooler' : (isLocalDatabase ? 'Local' : 'Remote'));
var client;
try {
    client = (0, postgres_1.default)(databaseUrl, {
        ssl: isLocalDatabase ? false : "require",
        prepare: !isSupabasePooler,
        idle_timeout: process.env.VERCEL ? 5 : 20,
        max_lifetime: 60 * 30,
        max: process.env.VERCEL ? 1 : 10,
        connect_timeout: 10,
    });
    console.log('✅ Database client created successfully');
}
catch (error) {
    console.error('❌ Error creating database client:', error);
    throw error;
}
exports.db = (0, postgres_js_1.drizzle)(client, { schema: schema });
console.log('✅ Drizzle ORM initialized');
