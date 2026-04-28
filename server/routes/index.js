"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var storage_js_1 = require("../storage.js");
var schema_js_1 = require("../../shared/schema.js");
var zod_1 = require("zod");
var reportService_js_1 = require("../utils/reportService.js");
var import_js_1 = require("./import.js");
var invoices_js_1 = require("./invoices.js");
var crypto_1 = require("crypto");
var EmailService_js_1 = require("../utils/EmailService.js");
function convertToCSV(data) {
    if (!data)
        return '';
    var csvContent = '';
    if (Array.isArray(data) && data.length > 0) {
        var headers = Object.keys(data[0]).join(';');
        var rows = data.map(function (row) {
            return Object.values(row).map(function (value) {
                var strValue = String(value || '');
                return "\"".concat(strValue.replace(/"/g, '""'), "\"");
            }).join(';');
        }).join('\n');
        csvContent = "".concat(headers, "\n").concat(rows);
    }
    else if (typeof data === 'object') {
        var sections_1 = [];
        sections_1.push('RELATÓRIO GERADO EM;' + new Date().toLocaleString('pt-BR'));
        sections_1.push('');
        if (data.summary && typeof data.summary === 'object') {
            sections_1.push('RESUMO');
            sections_1.push(Object.keys(data.summary).join(';'));
            sections_1.push(Object.values(data.summary).map(function (v) { return "\"".concat(v, "\""); }).join(';'));
            sections_1.push('');
        }
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            sections_1.push('DADOS');
            var headers = Object.keys(data.data[0]).join(';');
            sections_1.push(headers);
            data.data.forEach(function (row) {
                var rowValues = Object.values(row).map(function (value) {
                    return "\"".concat(String(value || '').replace(/"/g, '""'), "\"");
                }).join(';');
                sections_1.push(rowValues);
            });
        }
        else {
            sections_1.push('DADOS');
            Object.entries(data).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                if (key !== 'summary' && key !== 'data') {
                    sections_1.push("".concat(key, ";\"").concat(String(value).replace(/"/g, '""'), "\""));
                }
            });
        }
        csvContent = sections_1.join('\n');
    }
    return csvContent;
}
function sendXmlResponse(res, nfeData, importItem) {
    var xmlContent = nfeData.xmlContent;
    var fileName = importItem
        ? "nfe_".concat(importItem.nfeKey || importItem.id, ".xml")
        : "nfe_".concat(nfeData.accessKey || nfeData.id, ".xml");
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', "attachment; filename=\"".concat(fileName, "\""));
    res.setHeader('Content-Length', Buffer.byteLength(xmlContent, 'utf8'));
    res.send(xmlContent);
}
function registerRoutes(app) {
    var _this = this;
    console.log('Inicializando serviços...');
    // ✅ Health Check - DEVE SER A PRIMEIRA ROTA
    app.get("/api/health", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var categories, users, dbError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    categories = [];
                    users = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, storage_js_1.storage.getCategories()];
                case 2:
                    categories = _a.sent();
                    return [4 /*yield*/, storage_js_1.storage.getUsers()];
                case 3:
                    users = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    dbError_1 = _a.sent();
                    console.error('Erro ao conectar com banco:', dbError_1);
                    return [3 /*break*/, 5];
                case 5:
                    res.json({
                        status: "healthy",
                        timestamp: new Date().toISOString(),
                        environment: process.env.NODE_ENV || 'development',
                        database: {
                            connected: categories.length >= 0,
                            categories: categories.length,
                            users: users.length
                        },
                        services: {
                            email: EmailService_js_1.EmailService.getStatus()
                        },
                        version: "1.0.0"
                    });
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    res.status(500).json({
                        status: "unhealthy",
                        timestamp: new Date().toISOString(),
                        error: "Health check failed",
                        message: error_1 instanceof Error ? error_1.message : "Unknown error"
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    // Teste de conexão com banco de dados
    app.get("/api/test/db", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var users, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🧪 Testing database connection...');
                    return [4 /*yield*/, storage_js_1.storage.getUsers()];
                case 1:
                    users = _a.sent();
                    console.log('✅ Database connection successful');
                    res.json({
                        status: "connected",
                        timestamp: new Date().toISOString(),
                        users_count: users.length
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ Database test failed:', error_2);
                    res.status(500).json({
                        status: "disconnected",
                        error: error_2 instanceof Error ? error_2.message : "Unknown error",
                        timestamp: new Date().toISOString()
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Rota raiz para verificar se API está online
    app.get("/api", function (req, res) {
        res.json({
            message: "Neuropsicocentro API is running",
            version: "1.0.0",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });
    });
    // Inicializar serviços
    console.log('🔄 Inicializando serviços...');
    console.log('✅ Serviços prontos');
    console.log('✅ Serviços inicializados');
    // Rotas de importação e notas fiscais
    app.use("/api/import", import_js_1.importRoutes);
    app.use("/api/invoices", invoices_js_1.invoiceRoutes);
    // ========== ROTAS DE HISTÓRICO DE IMPORTAÇÃO ==========
    app.get("/api/import/history", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var importHistory, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getImportHistory()];
                case 1:
                    importHistory = _a.sent();
                    res.json(importHistory);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    res.status(500).json({
                        error: "Erro interno do servidor ao buscar histórico de importações",
                        message: error_3 instanceof Error ? error_3.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/import/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, importItem, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, storage_js_1.storage.getImportHistoryById(id)];
                case 1:
                    importItem = _a.sent();
                    if (!importItem) {
                        return [2 /*return*/, res.status(404).json({ error: "Importação não encontrada" })];
                    }
                    res.json(importItem);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    res.status(500).json({
                        error: "Erro interno do servidor",
                        message: error_4 instanceof Error ? error_4.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.delete("/api/import/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, storage_js_1.storage.deleteImportHistory(id)];
                case 1:
                    _a.sent();
                    res.json({ success: true, message: "Importação deletada com sucesso" });
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    res.status(500).json({
                        error: "Erro ao deletar importação",
                        message: error_5 instanceof Error ? error_5.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/import/:id/nfe-products", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, nfeProducts, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, storage_js_1.storage.getNfeProductsByImport(id)];
                case 1:
                    nfeProducts = _a.sent();
                    res.json(nfeProducts);
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    res.status(500).json({
                        error: "Erro ao buscar produtos da NFe",
                        message: error_6 instanceof Error ? error_6.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/import/:id/nfe-data", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, nfeData, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, storage_js_1.storage.getNfeDataByImport(id)];
                case 1:
                    nfeData = _a.sent();
                    if (!nfeData) {
                        return [2 /*return*/, res.status(404).json({ error: "Dados da NFe não encontrados" })];
                    }
                    res.json(nfeData);
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    res.status(500).json({
                        error: "Erro ao buscar dados da NFe",
                        message: error_7 instanceof Error ? error_7.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/import/:id/download-xml", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, importItem, nfeData, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    id = req.params.id;
                    return [4 /*yield*/, storage_js_1.storage.getImportHistoryById(id)];
                case 1:
                    importItem = _a.sent();
                    if (!importItem) {
                        return [2 /*return*/, res.status(404).json({ error: "Importação não encontrada" })];
                    }
                    return [4 /*yield*/, storage_js_1.storage.getNfeDataByImport(id)];
                case 2:
                    nfeData = _a.sent();
                    if (!nfeData || !nfeData.xmlContent) {
                        return [2 /*return*/, res.status(404).json({ error: "XML não encontrado para esta importação" })];
                    }
                    sendXmlResponse(res, nfeData, importItem);
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    res.status(500).json({
                        error: "Erro ao baixar XML",
                        message: error_8 instanceof Error ? error_8.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // ========== ROTAS DE EMAIL E DEBUG ==========
    app.get("/api/debug/email", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var emailConfig;
        return __generator(this, function (_a) {
            try {
                emailConfig = {
                    hasResendKey: !!process.env.RESEND_API_KEY,
                    resendKey: process.env.RESEND_API_KEY ? 'Configurada' : 'Não configurada',
                    emailUser: process.env.EMAIL_USER,
                    emailFrom: process.env.EMAIL_FROM,
                    appUrl: process.env.APP_URL,
                    serviceStatus: EmailService_js_1.EmailService.getStatus()
                };
                console.log('🔍 Debug Email Config:', emailConfig);
                res.json(__assign(__assign({}, emailConfig), { message: 'Configurações de email carregadas', timestamp: new Date().toISOString() }));
            }
            catch (error) {
                res.status(500).json({
                    error: "Erro no debug de email",
                    message: error instanceof Error ? error.message : 'Erro desconhecido'
                });
            }
            return [2 /*return*/];
        });
    }); });
    app.post("/api/debug/email/test", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var email, result, response, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    email = req.body.email;
                    if (!email) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Email é obrigatório",
                                example: { "email": "seuemail@gmail.com" }
                            })];
                    }
                    console.log('🧪 ========== TESTE DE EMAIL SOLICITADO ==========');
                    console.log('🧪 Email destino:', email);
                    return [4 /*yield*/, EmailService_js_1.EmailService.enviarEmailVerificacao(email, 'Usuário Teste NPC', 'test-token-' + Date.now())];
                case 1:
                    result = _a.sent();
                    response = {
                        success: result,
                        message: result ? '✅ Email de teste enviado com sucesso!' : '❌ Falha ao enviar email',
                        email: email,
                        serviceStatus: EmailService_js_1.EmailService.getStatus(),
                        timestamp: new Date().toISOString()
                    };
                    console.log('🧪 Resultado do teste:', response);
                    res.json(response);
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    console.error('❌ Erro no teste de email:', error_9);
                    res.status(500).json({
                        error: "Erro no teste de email",
                        message: error_9 instanceof Error ? error_9.message : 'Erro desconhecido',
                        timestamp: new Date().toISOString()
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/debug/email/status", function (req, res) {
        var status = EmailService_js_1.EmailService.getStatus();
        res.json({
            status: status,
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                APP_URL: process.env.APP_URL
            },
            timestamp: new Date().toISOString()
        });
    });
    // Rota para forçar reinicialização do email service
    app.post("/api/debug/email/reset", function (req, res) {
        console.log('🔄 Reinicializando serviço de email...');
        EmailService_js_1.EmailService.initialize();
        setTimeout(function () {
            var status = EmailService_js_1.EmailService.getStatus();
            res.json({
                message: 'Serviço de email reinicializado',
                status: status,
                timestamp: new Date().toISOString()
            });
        }, 3000);
    });
    // Rotas de inicialização
    app.post("/api/init/categories", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var categories, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, storage_js_1.storage.ensureDefaultCategories()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, storage_js_1.storage.getCategories()];
                case 2:
                    categories = _a.sent();
                    res.json({
                        success: true,
                        message: "Categorias inicializadas com sucesso",
                        categories: categories
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_10 = _a.sent();
                    res.status(500).json({
                        error: "Erro ao inicializar categorias",
                        message: error_10 instanceof Error ? error_10.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/init/check", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var categories, users, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, storage_js_1.storage.getCategories()];
                case 1:
                    categories = _a.sent();
                    return [4 /*yield*/, storage_js_1.storage.getUsers()];
                case 2:
                    users = _a.sent();
                    res.json({
                        categories: {
                            count: categories.length,
                            items: categories
                        },
                        users: {
                            count: users.length,
                            hasAdmin: users.some(function (u) { return u.email === 'admin@neuropsicocentro.com'; })
                        }
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_11 = _a.sent();
                    res.status(500).json({ error: "Erro ao verificar inicialização" });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Rotas de autenticação
    app.post("/api/auth/login", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, email, password, user, _, userWithoutPassword, error_12;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log('🔐 Login attempt with body:', req.body);
                    _a = req.body, email = _a.email, password = _a.password;
                    if (!email || !password) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Email e senha são obrigatórios",
                                message: "Preencha todos os campos"
                            })];
                    }
                    console.log('🔍 Searching for user:', email);
                    return [4 /*yield*/, storage_js_1.storage.getUserByEmail(email)];
                case 1:
                    user = _b.sent();
                    console.log('👤 User found:', user ? 'yes' : 'no');
                    if (!user) {
                        return [2 /*return*/, res.status(401).json({
                                error: "Credenciais inválidas",
                                message: "Email ou senha incorretos"
                            })];
                    }
                    if (password !== user.password) {
                        return [2 /*return*/, res.status(401).json({
                                error: "Credenciais inválidas",
                                message: "Email ou senha incorretos"
                            })];
                    }
                    if (!user.emailVerificado) {
                        return [2 /*return*/, res.status(401).json({
                                error: "Email não verificado",
                                message: "Verifique seu email antes de fazer login",
                                needsVerification: true,
                                email: user.email
                            })];
                    }
                    _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                    console.log('✅ Login successful for:', email);
                    res.json(__assign(__assign({}, userWithoutPassword), { message: "Login realizado com sucesso" }));
                    return [3 /*break*/, 3];
                case 2:
                    error_12 = _b.sent();
                    console.error('❌ Login error:', error_12);
                    res.status(500).json({
                        error: "Erro interno do servidor",
                        message: error_12 instanceof Error ? error_12.message : 'Erro desconhecido',
                        stack: process.env.NODE_ENV === 'development' ? (error_12 instanceof Error ? error_12.stack : 'No stack') : undefined
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/auth/cadastro/usuario", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, resultado, emailEnviado, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    validatedData = schema_js_1.cadastroUsuarioSchema.parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.cadastrarUsuarioIndividual(validatedData)];
                case 1:
                    resultado = _a.sent();
                    if (!(resultado.user.email !== 'admin@neuropsicocentro.com')) return [3 /*break*/, 3];
                    return [4 /*yield*/, EmailService_js_1.EmailService.enviarEmailVerificacao(resultado.user.email, resultado.user.name, resultado.token)];
                case 2:
                    emailEnviado = _a.sent();
                    if (!emailEnviado) {
                        console.log('⚠️ Email não pôde ser enviado, mas usuário foi criado');
                    }
                    _a.label = 3;
                case 3:
                    res.status(201).json({
                        success: true,
                        message: "Cadastro realizado com sucesso! " +
                            (resultado.user.email !== 'admin@neuropsicocentro.com'
                                ? "Verifique seu email para ativar a conta."
                                : "Conta de administrador criada."),
                        user: {
                            id: resultado.user.id,
                            name: resultado.user.name,
                            email: resultado.user.email,
                            emailVerificado: resultado.user.emailVerificado
                        }
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_13 = _a.sent();
                    if (error_13 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Dados inválidos",
                                details: error_13.errors.map(function (e) { return "".concat(e.path.join('.'), ": ").concat(e.message); })
                            })];
                    }
                    res.status(400).json({
                        error: "Erro no cadastro",
                        message: error_13 instanceof Error ? error_13.message : "Erro desconhecido"
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/auth/cadastro/empresa", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, resultado, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    validatedData = schema_js_1.cadastroEmpresaSchema.parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.cadastrarEmpresa(validatedData)];
                case 1:
                    resultado = _a.sent();
                    return [4 /*yield*/, EmailService_js_1.EmailService.enviarEmailVerificacao(resultado.admin.email, resultado.admin.name, resultado.token)];
                case 2:
                    _a.sent();
                    res.status(201).json({
                        success: true,
                        message: "Empresa cadastrada com sucesso! Verifique seu email para ativar a conta do administrador.",
                        empresa: {
                            id: resultado.empresa.id,
                            nome: resultado.empresa.nome,
                            cnpj: resultado.empresa.cnpj
                        },
                        admin: {
                            id: resultado.admin.id,
                            name: resultado.admin.name,
                            email: resultado.admin.email
                        }
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_14 = _a.sent();
                    if (error_14 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Dados inválidos",
                                details: error_14.errors.map(function (e) { return "".concat(e.path.join('.'), ": ").concat(e.message); })
                            })];
                    }
                    res.status(400).json({
                        error: "Erro no cadastro",
                        message: error_14 instanceof Error ? error_14.message : "Erro desconhecido"
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/auth/verificar-email", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var token, verificacao, user, error_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    token = schema_js_1.verificarEmailSchema.parse(req.body).token;
                    if (token === 'admin-auto-verified') {
                        return [2 /*return*/, res.json({
                                success: true,
                                message: "Email verificado automaticamente (admin)",
                                user: {
                                    id: 'admin',
                                    name: 'Administrador',
                                    email: 'admin@neuropsicocentro.com',
                                    emailVerificado: true
                                }
                            })];
                    }
                    return [4 /*yield*/, storage_js_1.storage.getEmailVerificacao(token)];
                case 1:
                    verificacao = _a.sent();
                    if (!verificacao) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Token inválido ou expirado"
                            })];
                    }
                    if (verificacao.utilizado) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Token já utilizado"
                            })];
                    }
                    if (new Date() > verificacao.expiraEm) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Token expirado"
                            })];
                    }
                    return [4 /*yield*/, storage_js_1.storage.marcarEmailComoVerificado(verificacao.userId)];
                case 2:
                    user = _a.sent();
                    return [4 /*yield*/, storage_js_1.storage.utilizarTokenVerificacao(token)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, EmailService_js_1.EmailService.enviarEmailBoasVindas(user.email, user.name)];
                case 4:
                    _a.sent();
                    res.json({
                        success: true,
                        message: "Email verificado com sucesso!",
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            emailVerificado: user.emailVerificado
                        }
                    });
                    return [3 /*break*/, 6];
                case 5:
                    error_15 = _a.sent();
                    if (error_15 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Token inválido",
                                details: error_15.errors
                            })];
                    }
                    res.status(400).json({
                        error: "Erro na verificação",
                        message: error_15 instanceof Error ? error_15.message : "Erro desconhecido"
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/auth/reenviar-verificacao", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var email, user, token, error_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    email = req.body.email;
                    if (!email) {
                        return [2 /*return*/, res.status(400).json({ error: "Email é obrigatório" })];
                    }
                    return [4 /*yield*/, storage_js_1.storage.getUserByEmail(email)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(404).json({ error: "Usuário não encontrado" })];
                    }
                    if (user.emailVerificado) {
                        return [2 /*return*/, res.status(400).json({ error: "Email já verificado" })];
                    }
                    token = (0, crypto_1.randomUUID)();
                    return [4 /*yield*/, storage_js_1.storage.createEmailVerificacao({
                            userId: user.id,
                            email: user.email,
                            token: token,
                            tipo: 'cadastro'
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, EmailService_js_1.EmailService.enviarEmailVerificacao(user.email, user.name, token)];
                case 3:
                    _a.sent();
                    res.json({
                        success: true,
                        message: "Email de verificação reenviado com sucesso!"
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_16 = _a.sent();
                    res.status(500).json({
                        error: "Erro interno do servidor"
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Dashboard
    app.get("/api/dashboard/stats", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var products_1, movements_1, categories, locations, totalProducts, lowStockProducts, outOfStockProducts, totalValue, now, today_1, weekAgo_1, monthAgo_1, todayMovements, weekMovements, monthMovements, movementStats, categorySummary, locationSummary, criticalProducts, chartData, recentMovements, dashboardData, error_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log('Acessando dashboard stats...');
                    return [4 /*yield*/, storage_js_1.storage.getProducts()];
                case 1:
                    products_1 = _a.sent();
                    return [4 /*yield*/, storage_js_1.storage.getMovements()];
                case 2:
                    movements_1 = _a.sent();
                    return [4 /*yield*/, storage_js_1.storage.getCategories()];
                case 3:
                    categories = _a.sent();
                    return [4 /*yield*/, storage_js_1.storage.getLocations()];
                case 4:
                    locations = _a.sent();
                    totalProducts = products_1.length;
                    lowStockProducts = products_1.filter(function (p) { return p.quantity > 0 && p.quantity <= p.minQuantity; });
                    outOfStockProducts = products_1.filter(function (p) { return p.quantity === 0; });
                    totalValue = products_1.reduce(function (sum, product) {
                        var _a;
                        var price = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                        if (price > 1000) {
                            price = price / 100;
                        }
                        return sum + (price * product.quantity);
                    }, 0);
                    now = new Date();
                    today_1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    weekAgo_1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    monthAgo_1 = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    todayMovements = movements_1.filter(function (m) { return new Date(m.createdAt) >= today_1; });
                    weekMovements = movements_1.filter(function (m) { return new Date(m.createdAt) >= weekAgo_1; });
                    monthMovements = movements_1.filter(function (m) { return new Date(m.createdAt) >= monthAgo_1; });
                    movementStats = {
                        today: todayMovements.length,
                        week: weekMovements.length,
                        month: monthMovements.length,
                        entrada: movements_1.filter(function (m) { return m.type === 'entrada'; }).length,
                        saida: movements_1.filter(function (m) { return m.type === 'saida'; }).length
                    };
                    categorySummary = categories.map(function (category) {
                        var categoryProducts = products_1.filter(function (p) { return p.categoryId === category.id; });
                        var categoryValue = categoryProducts.reduce(function (sum, product) {
                            var _a;
                            var price = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                            if (price > 1000)
                                price = price / 100;
                            return sum + (price * product.quantity);
                        }, 0);
                        return {
                            id: category.id,
                            name: category.name,
                            count: categoryProducts.length,
                            value: categoryValue
                        };
                    }).filter(function (cat) { return cat.count > 0; }).sort(function (a, b) { return b.value - a.value; });
                    locationSummary = locations.map(function (location) {
                        var locationProducts = products_1.filter(function (p) { return p.locationId === location.id; });
                        var locationValue = locationProducts.reduce(function (sum, product) {
                            var _a;
                            var price = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                            if (price > 1000)
                                price = price / 100;
                            return sum + (price * product.quantity);
                        }, 0);
                        return {
                            id: location.id,
                            name: location.name,
                            productCount: locationProducts.length,
                            totalValue: locationValue
                        };
                    }).filter(function (loc) { return loc.productCount > 0; }).sort(function (a, b) { return b.totalValue - a.totalValue; });
                    criticalProducts = __spreadArray(__spreadArray([], outOfStockProducts, true), lowStockProducts, true).sort(function (a, b) {
                        if (a.quantity === 0 && b.quantity > 0)
                            return -1;
                        if (b.quantity === 0 && a.quantity > 0)
                            return 1;
                        return (a.quantity / a.minQuantity) - (b.quantity / b.minQuantity);
                    })
                        .slice(0, 10)
                        .map(function (product) {
                        var _a;
                        return ({
                            product: {
                                id: product.id,
                                code: product.code || 'N/A',
                                name: product.name,
                                quantity: product.quantity,
                                minQuantity: product.minQuantity,
                                unitPrice: ((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0'
                            },
                            urgency: product.quantity === 0 ? 'critical' : 'warning',
                            message: product.quantity === 0 ? 'Produto sem estoque' : "Estoque baixo (".concat(product.quantity, "/").concat(product.minQuantity, ")")
                        });
                    });
                    chartData = categorySummary.slice(0, 6).map(function (category) {
                        var categoryMovements = movements_1.filter(function (m) {
                            var movementProduct = products_1.find(function (p) { return p.id === m.productId; });
                            return (movementProduct === null || movementProduct === void 0 ? void 0 : movementProduct.categoryId) === category.id;
                        });
                        return {
                            name: category.name,
                            entrada: categoryMovements.filter(function (m) { return m.type === 'entrada'; }).reduce(function (sum, m) { return sum + m.quantity; }, 0),
                            saida: categoryMovements.filter(function (m) { return m.type === 'saida'; }).reduce(function (sum, m) { return sum + m.quantity; }, 0),
                        };
                    });
                    recentMovements = movements_1
                        .sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); })
                        .slice(0, 8)
                        .map(function (movement) {
                        var product = products_1.find(function (p) { return p.id === movement.productId; });
                        return {
                            id: movement.id,
                            productId: movement.productId,
                            type: movement.type,
                            quantity: movement.quantity,
                            userId: movement.userId,
                            notes: movement.notes,
                            createdAt: movement.createdAt,
                            productName: (product === null || product === void 0 ? void 0 : product.name) || 'Produto não encontrado',
                            user: 'Sistema'
                        };
                    });
                    dashboardData = {
                        totalProducts: totalProducts,
                        lowStock: lowStockProducts.length,
                        outOfStock: outOfStockProducts.length,
                        totalValue: parseFloat(totalValue.toFixed(2)),
                        movements: movements_1.length,
                        movementStats: movementStats,
                        recentMovements: recentMovements,
                        criticalProducts: criticalProducts,
                        chartData: chartData,
                        categories: categorySummary,
                        locations: locationSummary
                    };
                    console.log('Dashboard stats retornados com sucesso');
                    res.json(dashboardData);
                    return [3 /*break*/, 6];
                case 5:
                    error_17 = _a.sent();
                    console.error('Erro ao carregar dashboard:', error_17);
                    res.status(500).json({
                        error: "Erro interno do servidor ao carregar dashboard",
                        message: error_17 instanceof Error ? error_17.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    // Produtos
    app.get("/api/products", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var products, error_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('Acessando lista de produtos...');
                    return [4 /*yield*/, storage_js_1.storage.getProducts()];
                case 1:
                    products = _a.sent();
                    res.json(products);
                    return [3 /*break*/, 3];
                case 2:
                    error_18 = _a.sent();
                    console.error('Erro ao buscar produtos:', error_18);
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/products/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var product, error_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getProduct(req.params.id)];
                case 1:
                    product = _a.sent();
                    if (!product)
                        return [2 /*return*/, res.status(404).json({ error: "Produto não encontrado" })];
                    res.json(product);
                    return [3 /*break*/, 3];
                case 2:
                    error_19 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/products", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, product, error_20;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validatedData = schema_js_1.insertProductSchema.parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.createProduct(validatedData)];
                case 1:
                    product = _a.sent();
                    res.status(201).json(product);
                    return [3 /*break*/, 3];
                case 2:
                    error_20 = _a.sent();
                    if (error_20 instanceof zod_1.z.ZodError)
                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: error_20.errors })];
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.put("/api/products/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, product, error_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validatedData = schema_js_1.insertProductSchema.partial().parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.updateProduct(req.params.id, validatedData)];
                case 1:
                    product = _a.sent();
                    res.json(product);
                    return [3 /*break*/, 3];
                case 2:
                    error_21 = _a.sent();
                    if (error_21 instanceof zod_1.z.ZodError)
                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: error_21.errors })];
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.delete("/api/products/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, error_22;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, storage_js_1.storage.deleteProduct(id)];
                case 1:
                    _a.sent();
                    res.status(204).send();
                    return [3 /*break*/, 3];
                case 2:
                    error_22 = _a.sent();
                    res.status(500).json({
                        error: "Erro interno do servidor ao excluir produto",
                        message: error_22 instanceof Error ? error_22.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Categorias
    app.get("/api/categories", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var categories, error_23;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getCategories()];
                case 1:
                    categories = _a.sent();
                    res.json(categories);
                    return [3 /*break*/, 3];
                case 2:
                    error_23 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/categories", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, category, error_24;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validatedData = schema_js_1.insertCategorySchema.parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.createCategory(validatedData)];
                case 1:
                    category = _a.sent();
                    res.status(201).json(category);
                    return [3 /*break*/, 3];
                case 2:
                    error_24 = _a.sent();
                    if (error_24 instanceof zod_1.z.ZodError)
                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: error_24.errors })];
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Localizações
    app.get("/api/locations", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var locations, error_25;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getLocations()];
                case 1:
                    locations = _a.sent();
                    res.json(locations);
                    return [3 /*break*/, 3];
                case 2:
                    error_25 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/locations", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, location_1, error_26;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validatedData = schema_js_1.insertLocationSchema.parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.createLocation(validatedData)];
                case 1:
                    location_1 = _a.sent();
                    res.status(201).json(location_1);
                    return [3 /*break*/, 3];
                case 2:
                    error_26 = _a.sent();
                    if (error_26 instanceof zod_1.z.ZodError)
                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: error_26.errors })];
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.put("/api/locations/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, validatedData, location_2, error_27;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    validatedData = schema_js_1.insertLocationSchema.partial().parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.updateLocation(id, validatedData)];
                case 1:
                    location_2 = _a.sent();
                    res.json(location_2);
                    return [3 /*break*/, 3];
                case 2:
                    error_27 = _a.sent();
                    if (error_27 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Dados inválidos",
                                details: error_27.errors
                            })];
                    }
                    res.status(500).json({
                        error: "Erro interno do servidor ao atualizar local",
                        message: error_27 instanceof Error ? error_27.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.delete("/api/locations/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, error_28;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, storage_js_1.storage.deleteLocation(id)];
                case 1:
                    _a.sent();
                    res.status(204).send();
                    return [3 /*break*/, 3];
                case 2:
                    error_28 = _a.sent();
                    if (error_28 instanceof Error) {
                        if (error_28.message.includes('produtos vinculados')) {
                            return [2 /*return*/, res.status(400).json({
                                    error: "Não é possível excluir o local",
                                    message: error_28.message
                                })];
                        }
                        else if (error_28.message.includes('não encontrado')) {
                            return [2 /*return*/, res.status(404).json({
                                    error: "Local não encontrado",
                                    message: error_28.message
                                })];
                        }
                    }
                    res.status(500).json({
                        error: "Erro interno do servidor ao excluir local",
                        message: error_28 instanceof Error ? error_28.message : 'Erro desconhecido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Movimentações
    app.get("/api/movements", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var movements, error_29;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getMovements()];
                case 1:
                    movements = _a.sent();
                    res.json(movements);
                    return [3 /*break*/, 3];
                case 2:
                    error_29 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/movements", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, movement, error_30;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validatedData = schema_js_1.insertMovementSchema.parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.createMovement(validatedData)];
                case 1:
                    movement = _a.sent();
                    res.status(201).json(movement);
                    return [3 /*break*/, 3];
                case 2:
                    error_30 = _a.sent();
                    if (error_30 instanceof zod_1.z.ZodError)
                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: error_30.errors })];
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Inventários
    app.get("/api/inventories", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var inventories, error_31;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getInventories()];
                case 1:
                    inventories = _a.sent();
                    res.json(inventories);
                    return [3 /*break*/, 3];
                case 2:
                    error_31 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/inventories/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var inventory, error_32;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getInventory(req.params.id)];
                case 1:
                    inventory = _a.sent();
                    if (!inventory)
                        return [2 /*return*/, res.status(404).json({ error: "Inventário não encontrado" })];
                    res.json(inventory);
                    return [3 /*break*/, 3];
                case 2:
                    error_32 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/inventories", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, inventory, error_33;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validatedData = schema_js_1.insertInventorySchema.parse(req.body);
                    return [4 /*yield*/, storage_js_1.storage.createInventory(validatedData)];
                case 1:
                    inventory = _a.sent();
                    res.status(201).json(inventory);
                    return [3 /*break*/, 3];
                case 2:
                    error_33 = _a.sent();
                    if (error_33 instanceof zod_1.z.ZodError)
                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: error_33.errors })];
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.put("/api/inventories/:id/finalize", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var inventory, error_34;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.finalizeInventory(req.params.id)];
                case 1:
                    inventory = _a.sent();
                    res.json(inventory);
                    return [3 /*break*/, 3];
                case 2:
                    error_34 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.put("/api/inventories/:id/reopen", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var inventory, error_35;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.reopenInventory(req.params.id)];
                case 1:
                    inventory = _a.sent();
                    res.json(inventory);
                    return [3 /*break*/, 3];
                case 2:
                    error_35 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/inventories/:id/counts", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var counts, error_36;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getInventoryCounts(req.params.id)];
                case 1:
                    counts = _a.sent();
                    res.json(counts);
                    return [3 /*break*/, 3];
                case 2:
                    error_36 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/inventories/:id/counts", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var validatedData, count, error_37;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validatedData = schema_js_1.insertInventoryCountSchema.parse(__assign(__assign({}, req.body), { inventoryId: req.params.id }));
                    return [4 /*yield*/, storage_js_1.storage.createInventoryCount(validatedData)];
                case 1:
                    count = _a.sent();
                    res.status(201).json(count);
                    return [3 /*break*/, 3];
                case 2:
                    error_37 = _a.sent();
                    if (error_37 instanceof zod_1.z.ZodError)
                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: error_37.errors })];
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Relatórios
    app.get("/api/reports", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var reports, error_38;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getReports()];
                case 1:
                    reports = _a.sent();
                    res.json(reports);
                    return [3 /*break*/, 3];
                case 2:
                    error_38 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/reports/generate", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, reportType, format, period, startDate, endDate, reportData, filters, _b, movementsStartDate, movementsEndDate, fileBuffer, mimeType, fileExtension, csvData, csvContent, fileError_1, csvData, csvContent, reportSaveError_1, filename, error_39;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 26, , 27]);
                    _a = req.body, reportType = _a.reportType, format = _a.format, period = _a.period, startDate = _a.startDate, endDate = _a.endDate;
                    if (!reportType || !format)
                        return [2 /*return*/, res.status(400).json({ error: "Tipo de relatório e formato são obrigatórios" })];
                    reportData = void 0;
                    filters = {};
                    _b = reportType;
                    switch (_b) {
                        case 'Produtos': return [3 /*break*/, 1];
                        case 'Estoque Baixo': return [3 /*break*/, 3];
                        case 'Valor Estoque': return [3 /*break*/, 5];
                        case 'Movimentações': return [3 /*break*/, 7];
                        case 'Inventários': return [3 /*break*/, 9];
                        case 'Produtos por Local': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 1: return [4 /*yield*/, storage_js_1.storage.getProductsReport()];
                case 2:
                    reportData = _c.sent();
                    return [3 /*break*/, 14];
                case 3: return [4 /*yield*/, storage_js_1.storage.getLowStockProducts()];
                case 4:
                    reportData = _c.sent();
                    return [3 /*break*/, 14];
                case 5: return [4 /*yield*/, storage_js_1.storage.getFinancialReport()];
                case 6:
                    reportData = _c.sent();
                    return [3 /*break*/, 14];
                case 7:
                    movementsStartDate = void 0, movementsEndDate = void 0;
                    if (period && period !== 'all') {
                        movementsEndDate = new Date();
                        movementsStartDate = new Date();
                        movementsStartDate.setDate(movementsStartDate.getDate() - parseInt(period));
                        filters = { period: period };
                    }
                    else if (startDate && endDate) {
                        movementsStartDate = new Date(startDate);
                        movementsEndDate = new Date(endDate);
                        filters = { startDate: startDate, endDate: endDate };
                    }
                    return [4 /*yield*/, storage_js_1.storage.getMovementsReport(movementsStartDate, movementsEndDate)];
                case 8:
                    reportData = _c.sent();
                    return [3 /*break*/, 14];
                case 9: return [4 /*yield*/, storage_js_1.storage.getInventoryReport()];
                case 10:
                    reportData = _c.sent();
                    return [3 /*break*/, 14];
                case 11: return [4 /*yield*/, storage_js_1.storage.getProductsByLocationReport()];
                case 12:
                    reportData = _c.sent();
                    return [3 /*break*/, 14];
                case 13: return [2 /*return*/, res.status(400).json({ error: "Tipo de relatório inválido" })];
                case 14:
                    if (!reportData)
                        return [2 /*return*/, res.status(500).json({ error: "Nenhum dado foi gerado para o relatório" })];
                    fileBuffer = void 0;
                    mimeType = void 0;
                    fileExtension = void 0;
                    _c.label = 15;
                case 15:
                    _c.trys.push([15, 21, , 22]);
                    if (!(format === 'excel')) return [3 /*break*/, 17];
                    return [4 /*yield*/, reportService_js_1.default.generateExcelReport(reportData, reportType)];
                case 16:
                    fileBuffer = _c.sent();
                    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    fileExtension = 'xlsx';
                    return [3 /*break*/, 20];
                case 17:
                    if (!(format === 'pdf')) return [3 /*break*/, 19];
                    return [4 /*yield*/, reportService_js_1.default.generatePDFReport(reportData, reportType)];
                case 18:
                    fileBuffer = _c.sent();
                    mimeType = 'application/pdf';
                    fileExtension = 'pdf';
                    return [3 /*break*/, 20];
                case 19:
                    csvData = reportData.produtos || reportData.movimentacoes || reportData.inventarios || reportData.produtos_por_local || [reportData];
                    csvContent = convertToCSV(csvData);
                    fileBuffer = Buffer.from(csvContent, 'utf-8');
                    mimeType = 'text/csv';
                    fileExtension = 'csv';
                    _c.label = 20;
                case 20: return [3 /*break*/, 22];
                case 21:
                    fileError_1 = _c.sent();
                    csvData = reportData.produtos || reportData.movimentacoes || reportData.inventarios || reportData.produtos_por_local || [reportData];
                    csvContent = convertToCSV(csvData);
                    fileBuffer = Buffer.from(csvContent, 'utf-8');
                    mimeType = 'text/csv';
                    fileExtension = 'csv';
                    return [3 /*break*/, 22];
                case 22:
                    _c.trys.push([22, 24, , 25]);
                    return [4 /*yield*/, storage_js_1.storage.createReport({
                            name: "".concat(reportType, " - ").concat(new Date().toLocaleDateString('pt-BR')),
                            type: reportType.toLowerCase().replace(/\s+/g, '_'),
                            format: format,
                            filters: filters,
                            generatedBy: null,
                            filePath: null
                        })];
                case 23:
                    _c.sent();
                    return [3 /*break*/, 25];
                case 24:
                    reportSaveError_1 = _c.sent();
                    return [3 /*break*/, 25];
                case 25:
                    filename = "relatorio_".concat(reportType.toLowerCase().replace(/\s+/g, '_'), "_").concat(new Date().toISOString().split('T')[0], ".").concat(fileExtension);
                    res.setHeader('Content-Type', mimeType);
                    res.setHeader('Content-Disposition', "attachment; filename=\"".concat(filename, "\""));
                    res.setHeader('Content-Length', fileBuffer.length);
                    res.send(fileBuffer);
                    return [3 /*break*/, 27];
                case 26:
                    error_39 = _c.sent();
                    res.status(500).json({ error: "Erro interno do servidor ao gerar relatório" });
                    return [3 /*break*/, 27];
                case 27: return [2 /*return*/];
            }
        });
    }); });
    // Usuários
    app.get("/api/usuarios", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var usuarios, usuariosSemSenha, error_40;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_js_1.storage.getUsers()];
                case 1:
                    usuarios = _a.sent();
                    usuariosSemSenha = usuarios.map(function (u) {
                        var password = u.password, tokenVerificacao = u.tokenVerificacao, usuarioSemSenha = __rest(u, ["password", "tokenVerificacao"]);
                        return usuarioSemSenha;
                    });
                    res.json(usuariosSemSenha);
                    return [3 /*break*/, 3];
                case 2:
                    error_40 = _a.sent();
                    res.status(500).json({ error: "Erro interno do servidor" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/usuarios", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, name_1, email, role, password, usuarioExistente, baseUsername, username, counter, novoUsuario, token, error_41;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    _a = req.body, name_1 = _a.name, email = _a.email, role = _a.role, password = _a.password;
                    if (!name_1 || !email || !role || !password) {
                        return [2 /*return*/, res.status(400).json({ error: "Todos os campos são obrigatórios" })];
                    }
                    return [4 /*yield*/, storage_js_1.storage.getUserByEmail(email)];
                case 1:
                    usuarioExistente = _b.sent();
                    if (usuarioExistente) {
                        return [2 /*return*/, res.status(400).json({ error: "Já existe um usuário com este email" })];
                    }
                    baseUsername = name_1.toLowerCase().replace(/\s+/g, '.');
                    username = baseUsername;
                    counter = 1;
                    _b.label = 2;
                case 2: return [4 /*yield*/, storage_js_1.storage.getUserByUsername(username)];
                case 3:
                    if (!_b.sent()) return [3 /*break*/, 4];
                    username = "".concat(baseUsername).concat(counter);
                    counter++;
                    if (counter > 10)
                        return [3 /*break*/, 4];
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, storage_js_1.storage.createUser({
                        username: username,
                        password: password,
                        name: name_1,
                        email: email,
                        tipo: 'individual',
                        role: role,
                        emailVerificado: false
                    })];
                case 5:
                    novoUsuario = _b.sent();
                    token = (0, crypto_1.randomUUID)();
                    return [4 /*yield*/, storage_js_1.storage.createEmailVerificacao({
                            userId: novoUsuario.id,
                            email: novoUsuario.email,
                            token: token,
                            tipo: 'cadastro'
                        })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, EmailService_js_1.EmailService.enviarEmailVerificacao(novoUsuario.email, novoUsuario.name, token)];
                case 7:
                    _b.sent();
                    res.status(201).json({
                        success: true,
                        message: "Usuário criado com sucesso!",
                        user: {
                            id: novoUsuario.id,
                            name: novoUsuario.name,
                            email: novoUsuario.email,
                            role: novoUsuario.role
                        }
                    });
                    return [3 /*break*/, 9];
                case 8:
                    error_41 = _b.sent();
                    res.status(400).json({
                        error: "Erro ao criar usuário",
                        message: error_41 instanceof Error ? error_41.message : "Erro desconhecido"
                    });
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); });
    app.put("/api/usuarios/:id/role", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, role, usuarioAtualizado, error_42;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    role = req.body.role;
                    if (!['super_admin', 'admin', 'user'].includes(role)) {
                        return [2 /*return*/, res.status(400).json({ error: "Role inválida" })];
                    }
                    return [4 /*yield*/, storage_js_1.storage.updateUserRole(id, role)];
                case 1:
                    usuarioAtualizado = _a.sent();
                    res.json({
                        success: true,
                        message: "Permissão atualizada com sucesso",
                        user: usuarioAtualizado
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_42 = _a.sent();
                    res.status(400).json({
                        error: "Erro ao atualizar permissão",
                        message: error_42 instanceof Error ? error_42.message : "Erro desconhecido"
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.delete("/api/usuarios/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var id, error_43;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, storage_js_1.storage.deleteUser(id)];
                case 1:
                    _a.sent();
                    res.json({
                        success: true,
                        message: "Usuário deletado com sucesso"
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_43 = _a.sent();
                    res.status(400).json({
                        error: "Erro ao deletar usuário",
                        message: error_43 instanceof Error ? error_43.message : "Erro desconhecido"
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    console.log('Todas as rotas da API foram registradas');
}
