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
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
var crypto_1 = require("crypto");
var db_js_1 = require("./db.js");
var schema_js_1 = require("../shared/schema.js");
var drizzle_orm_1 = require("drizzle-orm");
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
    }
    DatabaseStorage.prototype.ensureDefaultCategories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingCategories, defaultCategories, _i, defaultCategories_1, category, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.getCategories()];
                    case 1:
                        existingCategories = _a.sent();
                        if (!(existingCategories.length === 0)) return [3 /*break*/, 6];
                        console.log('Criando categorias padrão...');
                        defaultCategories = [
                            {
                                id: 'limpeza',
                                name: 'Produtos de Limpeza',
                                type: 'limpeza',
                                description: 'Produtos para limpeza e higienização'
                            },
                            {
                                id: 'ferramenta',
                                name: 'Ferramentas',
                                type: 'ferramenta',
                                description: 'Ferramentas manuais e elétricas'
                            },
                            {
                                id: 'insumo',
                                name: 'Insumos',
                                type: 'insumo',
                                description: 'Matérias-primas e insumos para produção'
                            },
                            {
                                id: 'equipamento',
                                name: 'Equipamentos',
                                type: 'equipamento',
                                description: 'Máquinas e equipamentos'
                            },
                            {
                                id: 'material',
                                name: 'Materiais',
                                type: 'material',
                                description: 'Materiais diversos'
                            },
                            {
                                id: 'outros',
                                name: 'Outros',
                                type: 'outros',
                                description: 'Outros tipos de produtos'
                            }
                        ];
                        _i = 0, defaultCategories_1 = defaultCategories;
                        _a.label = 2;
                    case 2:
                        if (!(_i < defaultCategories_1.length)) return [3 /*break*/, 5];
                        category = defaultCategories_1[_i];
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.categories).values(category)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        console.log('Categorias padrão criadas com sucesso');
                        return [3 /*break*/, 7];
                    case 6:
                        console.log('Categorias já existem:', existingCategories.length);
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        console.error('Erro ao criar categorias padrão:', error_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.ensureDefaultUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, defaultUser, user, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // Criar categorias primeiro
                        return [4 /*yield*/, this.ensureDefaultCategories()];
                    case 1:
                        // Criar categorias primeiro
                        _a.sent();
                        return [4 /*yield*/, this.getUserByEmail('admin@neuropsicocentro.com')];
                    case 2:
                        existingUser = _a.sent();
                        if (existingUser) {
                            console.log('Usuário admin já existe:', existingUser.id);
                            return [2 /*return*/, existingUser.id];
                        }
                        console.log('Criando usuário admin padrão...');
                        defaultUser = {
                            username: 'admin',
                            password: 'admin123',
                            name: 'Administrador',
                            email: 'admin@neuropsicocentro.com',
                            tipo: 'individual',
                            role: 'super_admin',
                            emailVerificado: true
                        };
                        return [4 /*yield*/, this.createUser(defaultUser)];
                    case 3:
                        user = _a.sent();
                        console.log('Usuário admin criado com sucesso:', user.id);
                        return [2 /*return*/, user.id];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Erro ao criar usuário padrão:', error_2);
                        // Retorna um ID fake para permitir que o app continue
                        return [2 /*return*/, 'default-admin-id'];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).orderBy(schema_js_1.users.name)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Erro ao buscar usuários:', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Erro ao buscar usuário:', error_4);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.username, username))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Erro ao buscar usuário por username:', error_5);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6, result, fallbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 7]);
                        console.log('🔍 Querying user by email:', email);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email))];
                    case 1:
                        result = _a.sent();
                        console.log('✅ Query successful, found:', result.length > 0 ? 'user' : 'no user');
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_6 = _a.sent();
                        console.error('❌ Error querying by email:', error_6 instanceof Error ? error_6.message : error_6);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        console.log('⚠️ Fallback: Querying user by username:', email);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.username, email))];
                    case 4:
                        result = _a.sent();
                        console.log('✅ Fallback query successful, found:', result.length > 0 ? 'user' : 'no user');
                        return [2 /*return*/, result[0]];
                    case 5:
                        fallbackError_1 = _a.sent();
                        console.error('❌ Fallback error querying by username:', fallbackError_1 instanceof Error ? fallbackError_1.message : fallbackError_1);
                        return [2 /*return*/, undefined];
                    case 6: return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userData, createdUser, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = (0, crypto_1.randomUUID)();
                        userData = {
                            id: id,
                            username: insertUser.username,
                            password: insertUser.password,
                            name: insertUser.name,
                            email: insertUser.email,
                            tipo: insertUser.tipo,
                            role: insertUser.role,
                            empresaId: insertUser.empresaId || null,
                            emailVerificado: insertUser.emailVerificado || false,
                            tokenVerificacao: null,
                            dataVerificacao: null,
                            createdAt: new Date()
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.users).values(userData)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getUser(id)];
                    case 2:
                        createdUser = _a.sent();
                        if (!createdUser) {
                            throw new Error("Usuário não encontrado após criação");
                        }
                        return [2 /*return*/, createdUser];
                    case 3:
                        error_7 = _a.sent();
                        console.error('Erro em createUser:', error_7);
                        throw new Error("Erro ao criar usuário: " + (error_7 instanceof Error ? error_7.message : 'Erro desconhecido'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getProducts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.products).orderBy(schema_js_1.products.name)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Erro ao buscar produtos:', error_8);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getProduct = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.products).where((0, drizzle_orm_1.eq)(schema_js_1.products.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Erro ao buscar produto:', error_9);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createProduct = function (insertProduct) {
        return __awaiter(this, void 0, void 0, function () {
            var id, productData, result, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = (0, crypto_1.randomUUID)();
                        productData = {
                            id: id,
                            code: insertProduct.code,
                            name: insertProduct.name,
                            categoryId: insertProduct.categoryId,
                            locationId: insertProduct.locationId,
                            quantity: insertProduct.quantity,
                            minQuantity: insertProduct.minQuantity,
                            unitPrice: insertProduct.unitPrice,
                            description: insertProduct.description,
                            createdAt: new Date()
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.products).values(productData)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.products).where((0, drizzle_orm_1.eq)(schema_js_1.products.id, id))];
                    case 2:
                        result = _a.sent();
                        if (!result[0])
                            throw new Error("Produto não encontrado após criação");
                        return [2 /*return*/, result[0]];
                    case 3:
                        error_10 = _a.sent();
                        console.error('Erro ao criar produto:', error_10);
                        throw new Error("Erro ao criar produto");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateProduct = function (id, productData) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, updated, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        updateData = __assign({}, productData);
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.products).set(updateData).where((0, drizzle_orm_1.eq)(schema_js_1.products.id, id))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getProduct(id)];
                    case 2:
                        updated = _a.sent();
                        if (!updated)
                            throw new Error("Product not found");
                        return [2 /*return*/, updated];
                    case 3:
                        error_11 = _a.sent();
                        console.error('Erro ao atualizar produto:', error_11);
                        throw error_11;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteProduct = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var product, error_12;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getProduct(id)];
                    case 1:
                        product = _a.sent();
                        if (!product) {
                            throw new Error("Produto não encontrado");
                        }
                        return [4 /*yield*/, db_js_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var productMovements, movementError_1, inventoryCountsResult, inventoryError_1, nfeProductsResult, nfeError_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 4, , 5]);
                                            return [4 /*yield*/, tx.select()
                                                    .from(schema_js_1.movements)
                                                    .where((0, drizzle_orm_1.eq)(schema_js_1.movements.productId, id))];
                                        case 1:
                                            productMovements = _a.sent();
                                            if (!(productMovements.length > 0)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, tx.delete(schema_js_1.movements).where((0, drizzle_orm_1.eq)(schema_js_1.movements.productId, id))];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [3 /*break*/, 5];
                                        case 4:
                                            movementError_1 = _a.sent();
                                            throw new Error("Erro ao excluir movimenta\u00E7\u00F5es: ".concat(movementError_1));
                                        case 5:
                                            _a.trys.push([5, 9, , 10]);
                                            return [4 /*yield*/, tx.select()
                                                    .from(schema_js_1.inventoryCounts)
                                                    .where((0, drizzle_orm_1.eq)(schema_js_1.inventoryCounts.productId, id))];
                                        case 6:
                                            inventoryCountsResult = _a.sent();
                                            if (!(inventoryCountsResult.length > 0)) return [3 /*break*/, 8];
                                            return [4 /*yield*/, tx.delete(schema_js_1.inventoryCounts).where((0, drizzle_orm_1.eq)(schema_js_1.inventoryCounts.productId, id))];
                                        case 7:
                                            _a.sent();
                                            _a.label = 8;
                                        case 8: return [3 /*break*/, 10];
                                        case 9:
                                            inventoryError_1 = _a.sent();
                                            throw new Error("Erro ao excluir contagens de invent\u00E1rio: ".concat(inventoryError_1));
                                        case 10:
                                            _a.trys.push([10, 14, , 15]);
                                            return [4 /*yield*/, tx.select()
                                                    .from(schema_js_1.nfeProducts)
                                                    .where((0, drizzle_orm_1.eq)(schema_js_1.nfeProducts.productId, id))];
                                        case 11:
                                            nfeProductsResult = _a.sent();
                                            if (!(nfeProductsResult.length > 0)) return [3 /*break*/, 13];
                                            return [4 /*yield*/, tx.update(schema_js_1.nfeProducts)
                                                    .set({ productId: null })
                                                    .where((0, drizzle_orm_1.eq)(schema_js_1.nfeProducts.productId, id))];
                                        case 12:
                                            _a.sent();
                                            _a.label = 13;
                                        case 13: return [3 /*break*/, 15];
                                        case 14:
                                            nfeError_1 = _a.sent();
                                            throw new Error("Erro ao atualizar produtos NFe: ".concat(nfeError_1));
                                        case 15: return [4 /*yield*/, tx.delete(schema_js_1.products).where((0, drizzle_orm_1.eq)(schema_js_1.products.id, id))];
                                        case 16:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_12 = _a.sent();
                        console.error('Erro ao deletar produto:', error_12);
                        if (error_12 instanceof Error) {
                            if (error_12.message.includes('violates foreign key constraint')) {
                                throw new Error('Não é possível excluir o produto pois ele está vinculado a outros registros no sistema.');
                            }
                            else if (error_12.message.includes('syntax error')) {
                                throw new Error('Erro de sintaxe no banco de dados. Contate o administrador.');
                            }
                            else {
                                throw new Error("Erro ao excluir produto: ".concat(error_12.message));
                            }
                        }
                        else {
                            throw new Error('Erro desconhecido ao excluir produto');
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getProductsByCategory = function (categoryId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.products).where((0, drizzle_orm_1.eq)(schema_js_1.products.categoryId, categoryId)).orderBy(schema_js_1.products.name)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_13 = _a.sent();
                        console.error('Erro ao buscar produtos por categoria:', error_13);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getCategories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.categories).orderBy(schema_js_1.categories.name)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_14 = _a.sent();
                        console.error('Erro ao buscar categorias:', error_14);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getCategory = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.categories).where((0, drizzle_orm_1.eq)(schema_js_1.categories.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_15 = _a.sent();
                        console.error('Erro ao buscar categoria:', error_15);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createCategory = function (insertCategory) {
        return __awaiter(this, void 0, void 0, function () {
            var id, categoryData, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        categoryData = {
                            id: id,
                            name: insertCategory.name,
                            type: insertCategory.type,
                            description: insertCategory.description
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.categories).values(categoryData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, categoryData];
                    case 2:
                        error_16 = _a.sent();
                        console.error('Erro ao criar categoria:', error_16);
                        throw error_16;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getLocations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.locations).orderBy(schema_js_1.locations.name)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_17 = _a.sent();
                        console.error('Erro ao buscar localizações:', error_17);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getLocation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.locations).where((0, drizzle_orm_1.eq)(schema_js_1.locations.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_18 = _a.sent();
                        console.error('Erro ao buscar localização:', error_18);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createLocation = function (insertLocation) {
        return __awaiter(this, void 0, void 0, function () {
            var id, locationData, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        locationData = {
                            id: id,
                            name: insertLocation.name,
                            description: insertLocation.description
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.locations).values(locationData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, locationData];
                    case 2:
                        error_19 = _a.sent();
                        console.error('Erro ao criar localização:', error_19);
                        throw error_19;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateLocation = function (id, locationData) {
        return __awaiter(this, void 0, void 0, function () {
            var existingLocation, updated, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getLocation(id)];
                    case 1:
                        existingLocation = _a.sent();
                        if (!existingLocation) {
                            throw new Error("Local não encontrado");
                        }
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.locations).set(locationData).where((0, drizzle_orm_1.eq)(schema_js_1.locations.id, id))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getLocation(id)];
                    case 3:
                        updated = _a.sent();
                        if (!updated) {
                            throw new Error("Local não encontrado após atualização");
                        }
                        return [2 /*return*/, updated];
                    case 4:
                        error_20 = _a.sent();
                        console.error('Erro ao atualizar localização:', error_20);
                        throw error_20;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteLocation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var location_1, products_1, productsUsingLocation, error_21;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getLocation(id)];
                    case 1:
                        location_1 = _a.sent();
                        if (!location_1) {
                            throw new Error("Local não encontrado");
                        }
                        return [4 /*yield*/, this.getProducts()];
                    case 2:
                        products_1 = _a.sent();
                        productsUsingLocation = products_1.filter(function (product) { return product.locationId === id; });
                        if (productsUsingLocation.length > 0) {
                            throw new Error("Existem ".concat(productsUsingLocation.length, " produtos vinculados a este local. Movimente os produtos para outro local antes de excluir."));
                        }
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.locations).where((0, drizzle_orm_1.eq)(schema_js_1.locations.id, id))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_21 = _a.sent();
                        console.error('Erro ao deletar localização:', error_21);
                        throw error_21;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getMovements = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.movements).orderBy((0, drizzle_orm_1.desc)(schema_js_1.movements.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_22 = _a.sent();
                        console.error('Erro ao buscar movimentações:', error_22);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createMovement = function (insertMovement) {
        return __awaiter(this, void 0, void 0, function () {
            var id, movementData, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        movementData = {
                            id: id,
                            productId: insertMovement.productId,
                            type: insertMovement.type,
                            quantity: insertMovement.quantity,
                            userId: insertMovement.userId,
                            notes: insertMovement.notes,
                            createdAt: new Date()
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.movements).values(movementData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, movementData];
                    case 2:
                        error_23 = _a.sent();
                        console.error('Erro ao criar movimentação:', error_23);
                        throw error_23;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getMovementsByProduct = function (productId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_24;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select()
                                .from(schema_js_1.movements)
                                .where((0, drizzle_orm_1.eq)(schema_js_1.movements.productId, productId))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_24 = _a.sent();
                        console.error('Erro ao buscar movimentações por produto:', error_24);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInventories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_25;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventories).orderBy((0, drizzle_orm_1.desc)(schema_js_1.inventories.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_25 = _a.sent();
                        console.error('Erro ao buscar inventários:', error_25);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInventory = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_26;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventories).where((0, drizzle_orm_1.eq)(schema_js_1.inventories.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_26 = _a.sent();
                        console.error('Erro ao buscar inventário:', error_26);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createInventory = function (insertInventory) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, inventoryData, result, error_27;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        id = (0, crypto_1.randomUUID)();
                        userId = insertInventory.userId;
                        if (!!userId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.ensureDefaultUser()];
                    case 1:
                        userId = _a.sent();
                        _a.label = 2;
                    case 2:
                        inventoryData = {
                            id: id,
                            name: insertInventory.name,
                            userId: userId,
                            createdAt: new Date(),
                            status: 'em_andamento',
                            finishedAt: null
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.inventories).values(inventoryData)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventories).where((0, drizzle_orm_1.eq)(schema_js_1.inventories.id, id))];
                    case 4:
                        result = _a.sent();
                        if (!result[0])
                            throw new Error("Inventário não encontrado após criação");
                        return [2 /*return*/, result[0]];
                    case 5:
                        error_27 = _a.sent();
                        console.error('Erro ao criar inventário:', error_27);
                        throw new Error("Erro ao criar inventário");
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateInventory = function (id, inventoryData) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, error_28;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.inventories).set(inventoryData).where((0, drizzle_orm_1.eq)(schema_js_1.inventories.id, id))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventories).where((0, drizzle_orm_1.eq)(schema_js_1.inventories.id, id))];
                    case 2:
                        updated = _a.sent();
                        if (!updated[0])
                            throw new Error("Inventory not found");
                        return [2 /*return*/, updated[0]];
                    case 3:
                        error_28 = _a.sent();
                        console.error('Erro ao atualizar inventário:', error_28);
                        throw error_28;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.finalizeInventory = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, error_29;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.inventories).set({ status: 'finalizado', finishedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_js_1.inventories.id, id))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventories).where((0, drizzle_orm_1.eq)(schema_js_1.inventories.id, id))];
                    case 2:
                        updated = _a.sent();
                        if (!updated[0])
                            throw new Error("Inventário não encontrado");
                        return [2 /*return*/, updated[0]];
                    case 3:
                        error_29 = _a.sent();
                        console.error('Erro ao finalizar inventário:', error_29);
                        throw new Error("Erro ao finalizar inventário");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.reopenInventory = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, error_30;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.inventories)
                                .set({
                                status: 'em_andamento',
                                finishedAt: null
                            })
                                .where((0, drizzle_orm_1.eq)(schema_js_1.inventories.id, id))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventories).where((0, drizzle_orm_1.eq)(schema_js_1.inventories.id, id))];
                    case 2:
                        updated = _a.sent();
                        if (!updated[0])
                            throw new Error("Inventário não encontrado");
                        return [2 /*return*/, updated[0]];
                    case 3:
                        error_30 = _a.sent();
                        console.error('Erro ao reabrir inventário:', error_30);
                        throw new Error("Erro ao reabrir inventário");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInventoryCounts = function (inventoryId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_31;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventoryCounts).where((0, drizzle_orm_1.eq)(schema_js_1.inventoryCounts.inventoryId, inventoryId)).orderBy(schema_js_1.inventoryCounts.createdAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_31 = _a.sent();
                        console.error('Erro ao buscar contagens de inventário:', error_31);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createInventoryCount = function (insertCount) {
        return __awaiter(this, void 0, void 0, function () {
            var existingCount, id, updated, id, countData, result, error_32;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventoryCounts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.inventoryCounts.inventoryId, insertCount.inventoryId), (0, drizzle_orm_1.eq)(schema_js_1.inventoryCounts.productId, insertCount.productId)))];
                    case 1:
                        existingCount = _a.sent();
                        if (!(existingCount.length > 0)) return [3 /*break*/, 4];
                        id = existingCount[0].id;
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.inventoryCounts).set({
                                countedQuantity: insertCount.countedQuantity,
                                difference: insertCount.difference,
                                notes: insertCount.notes
                            }).where((0, drizzle_orm_1.eq)(schema_js_1.inventoryCounts.id, id))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventoryCounts).where((0, drizzle_orm_1.eq)(schema_js_1.inventoryCounts.id, id))];
                    case 3:
                        updated = _a.sent();
                        return [2 /*return*/, updated[0]];
                    case 4:
                        id = (0, crypto_1.randomUUID)();
                        countData = {
                            id: id,
                            inventoryId: insertCount.inventoryId,
                            productId: insertCount.productId,
                            countedQuantity: insertCount.countedQuantity,
                            difference: insertCount.difference,
                            notes: insertCount.notes,
                            createdAt: new Date()
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.inventoryCounts).values(countData)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.inventoryCounts).where((0, drizzle_orm_1.eq)(schema_js_1.inventoryCounts.id, id))];
                    case 6:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_32 = _a.sent();
                        console.error('Erro ao criar contagem de inventário:', error_32);
                        throw new Error("Erro ao criar contagem de inventário");
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createReport = function (insertReport) {
        return __awaiter(this, void 0, void 0, function () {
            var id, reportData, error_33;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        reportData = {
                            id: id,
                            name: insertReport.name,
                            type: insertReport.type,
                            format: insertReport.format,
                            filters: insertReport.filters || {},
                            generatedBy: insertReport.generatedBy,
                            filePath: insertReport.filePath,
                            fileSize: 0,
                            createdAt: new Date()
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.reports).values(reportData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, reportData];
                    case 2:
                        error_33 = _a.sent();
                        console.error('Erro ao criar relatório:', error_33);
                        throw error_33;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getReports = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_34;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.reports).orderBy((0, drizzle_orm_1.desc)(schema_js_1.reports.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_34 = _a.sent();
                        console.error('Erro ao buscar relatórios:', error_34);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getReport = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_35;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.reports).where((0, drizzle_orm_1.eq)(schema_js_1.reports.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_35 = _a.sent();
                        console.error('Erro ao buscar relatório:', error_35);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteReport = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_36;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.reports).where((0, drizzle_orm_1.eq)(schema_js_1.reports.id, id))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_36 = _a.sent();
                        console.error('Erro ao deletar relatório:', error_36);
                        throw error_36;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getProductsReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var products_2, categories_1, locations_1, enrichedProducts, totalValue, lowStockCount, outOfStockCount, result, error_37;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getProducts()];
                    case 1:
                        products_2 = _a.sent();
                        return [4 /*yield*/, this.getCategories()];
                    case 2:
                        categories_1 = _a.sent();
                        return [4 /*yield*/, this.getLocations()];
                    case 3:
                        locations_1 = _a.sent();
                        enrichedProducts = products_2.map(function (product) {
                            var _a;
                            var category = categories_1.find(function (c) { return c.id === product.categoryId; });
                            var location = locations_1.find(function (l) { return l.id === product.locationId; });
                            var unitPrice = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                            var totalValue = unitPrice * product.quantity;
                            return {
                                id: product.id,
                                codigo: product.code || 'N/A',
                                nome: product.name,
                                categoria: (category === null || category === void 0 ? void 0 : category.name) || 'Sem Categoria',
                                localizacao: (location === null || location === void 0 ? void 0 : location.name) || 'Sem Local',
                                quantidade: product.quantity,
                                estoque_minimo: product.minQuantity,
                                preco_unitario: unitPrice,
                                valor_total: totalValue,
                                descricao: product.description || '',
                                status: product.quantity === 0 ? 'SEM ESTOQUE' :
                                    product.quantity <= product.minQuantity ? 'ESTOQUE BAIXO' : 'NORMAL'
                            };
                        });
                        totalValue = enrichedProducts.reduce(function (sum, p) { return sum + p.valor_total; }, 0);
                        lowStockCount = products_2.filter(function (p) { return p.quantity <= p.minQuantity; }).length;
                        outOfStockCount = products_2.filter(function (p) { return p.quantity === 0; }).length;
                        result = {
                            titulo: 'Relatório de Produtos',
                            produtos: enrichedProducts,
                            resumo: {
                                total_produtos: products_2.length,
                                valor_total_estoque: totalValue,
                                produtos_estoque_baixo: lowStockCount,
                                produtos_sem_estoque: outOfStockCount,
                                produtos_normais: products_2.length - lowStockCount - outOfStockCount
                            },
                            gerado_em: new Date().toISOString()
                        };
                        return [2 /*return*/, result];
                    case 4:
                        error_37 = _a.sent();
                        console.error('Erro ao gerar relatório de produtos:', error_37);
                        throw new Error('Erro ao gerar relatório de produtos');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getLowStockProducts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var products_3, categories_2, lowStockProducts, enrichedProducts, criticalProducts, warningProducts, totalValueAtRisk, result, error_38;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getProducts()];
                    case 1:
                        products_3 = _a.sent();
                        return [4 /*yield*/, this.getCategories()];
                    case 2:
                        categories_2 = _a.sent();
                        lowStockProducts = products_3.filter(function (p) { return p.quantity <= p.minQuantity; });
                        enrichedProducts = lowStockProducts.map(function (product) {
                            var _a;
                            var category = categories_2.find(function (c) { return c.id === product.categoryId; });
                            var unitPrice = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                            var difference = product.minQuantity - product.quantity;
                            var valueAtRisk = unitPrice * difference;
                            return {
                                id: product.id,
                                codigo: product.code || 'N/A',
                                nome: product.name,
                                categoria: (category === null || category === void 0 ? void 0 : category.name) || 'Sem Categoria',
                                quantidade_atual: product.quantity,
                                estoque_minimo: product.minQuantity,
                                diferenca: difference,
                                preco_unitario: unitPrice,
                                valor_em_risco: valueAtRisk,
                                urgencia: product.quantity === 0 ? 'CRÍTICO' : 'ALERTA',
                                acao_recomendada: product.quantity === 0 ? 'REPOR URGENTEMENTE' : 'MONITORAR E REPOR'
                            };
                        });
                        criticalProducts = lowStockProducts.filter(function (p) { return p.quantity === 0; }).length;
                        warningProducts = lowStockProducts.filter(function (p) { return p.quantity > 0 && p.quantity <= p.minQuantity; }).length;
                        totalValueAtRisk = enrichedProducts.reduce(function (sum, p) { return sum + p.valor_em_risco; }, 0);
                        result = {
                            titulo: 'Relatório de Estoque Baixo',
                            produtos: enrichedProducts,
                            resumo: {
                                total_estoque_baixo: lowStockProducts.length,
                                produtos_criticos: criticalProducts,
                                produtos_alerta: warningProducts,
                                valor_total_em_risco: totalValueAtRisk
                            },
                            gerado_em: new Date().toISOString()
                        };
                        return [2 /*return*/, result];
                    case 3:
                        error_38 = _a.sent();
                        console.error('Erro ao gerar relatório de estoque baixo:', error_38);
                        throw new Error('Erro ao gerar relatório de estoque baixo');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getFinancialReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var products_4, categories_3, totalValue_1, valorPorCategoria, topProdutos, result, error_39;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getProducts()];
                    case 1:
                        products_4 = _a.sent();
                        return [4 /*yield*/, this.getCategories()];
                    case 2:
                        categories_3 = _a.sent();
                        totalValue_1 = products_4.reduce(function (sum, product) {
                            var _a;
                            var price = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                            return sum + (price * product.quantity);
                        }, 0);
                        valorPorCategoria = categories_3.map(function (category) {
                            var categoryProducts = products_4.filter(function (p) { return p.categoryId === category.id; });
                            var valorCategoria = categoryProducts.reduce(function (sum, product) {
                                var _a;
                                var price = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                                return sum + (price * product.quantity);
                            }, 0);
                            return {
                                categoria: category.name,
                                quantidade_produtos: categoryProducts.length,
                                valor_total: valorCategoria,
                                percentual: totalValue_1 > 0 ? (valorCategoria / totalValue_1) * 100 : 0
                            };
                        }).filter(function (item) { return item.quantidade_produtos > 0; });
                        topProdutos = products_4
                            .map(function (product) {
                            var _a;
                            var category = categories_3.find(function (c) { return c.id === product.categoryId; });
                            var unitPrice = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                            var totalValue = unitPrice * product.quantity;
                            return {
                                nome: product.name,
                                codigo: product.code || 'N/A',
                                categoria: (category === null || category === void 0 ? void 0 : category.name) || 'Sem Categoria',
                                quantidade: product.quantity,
                                preco_unitario: unitPrice,
                                valor_total: totalValue
                            };
                        })
                            .sort(function (a, b) { return b.valor_total - a.valor_total; })
                            .slice(0, 10);
                        result = {
                            titulo: 'Relatório Financeiro do Estoque',
                            resumo: {
                                valor_total_estoque: totalValue_1,
                                total_produtos: products_4.length,
                                valor_medio_produto: products_4.length > 0 ? totalValue_1 / products_4.length : 0,
                                investimento_total: totalValue_1
                            },
                            valor_por_categoria: valorPorCategoria,
                            top_produtos: topProdutos,
                            gerado_em: new Date().toISOString()
                        };
                        return [2 /*return*/, result];
                    case 3:
                        error_39 = _a.sent();
                        console.error('Erro ao gerar relatório financeiro:', error_39);
                        throw new Error('Erro ao gerar relatório financeiro');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getMovementsReport = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var movements_1, products_5, enrichedMovements, entradaTotal, saidaTotal, result, error_40;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getMovements()];
                    case 1:
                        movements_1 = _a.sent();
                        return [4 /*yield*/, this.getProducts()];
                    case 2:
                        products_5 = _a.sent();
                        if (startDate || endDate) {
                            movements_1 = movements_1.filter(function (movement) {
                                var movementDate = new Date(movement.createdAt);
                                var matchesStart = !startDate || movementDate >= startDate;
                                var matchesEnd = !endDate || movementDate <= endDate;
                                return matchesStart && matchesEnd;
                            });
                        }
                        enrichedMovements = movements_1.map(function (movement) {
                            var product = products_5.find(function (p) { return p.id === movement.productId; });
                            return {
                                id: movement.id,
                                produto: (product === null || product === void 0 ? void 0 : product.name) || 'Produto não encontrado',
                                codigo_produto: (product === null || product === void 0 ? void 0 : product.code) || 'N/A',
                                tipo: movement.type === 'entrada' ? 'ENTRADA' : movement.type === 'saida' ? 'SAÍDA' : 'AJUSTE',
                                quantidade: movement.quantity,
                                data: new Date(movement.createdAt).toLocaleDateString('pt-BR'),
                                hora: new Date(movement.createdAt).toLocaleTimeString('pt-BR'),
                                observacoes: movement.notes || 'Sem observações'
                            };
                        });
                        entradaTotal = movements_1.filter(function (m) { return m.type === 'entrada'; }).reduce(function (sum, m) { return sum + m.quantity; }, 0);
                        saidaTotal = movements_1.filter(function (m) { return m.type === 'saida'; }).reduce(function (sum, m) { return sum + m.quantity; }, 0);
                        result = {
                            titulo: 'Relatório de Movimentações',
                            periodo: {
                                inicio: (startDate === null || startDate === void 0 ? void 0 : startDate.toISOString().split('T')[0]) || 'Todo o período',
                                fim: (endDate === null || endDate === void 0 ? void 0 : endDate.toISOString().split('T')[0]) || 'Todo o período'
                            },
                            movimentacoes: enrichedMovements,
                            resumo: {
                                total_movimentacoes: movements_1.length,
                                entradas: movements_1.filter(function (m) { return m.type === 'entrada'; }).length,
                                saidas: movements_1.filter(function (m) { return m.type === 'saida'; }).length,
                                ajustes: movements_1.filter(function (m) { return m.type === 'ajuste'; }).length,
                                quantidade_total_entrada: entradaTotal,
                                quantidade_total_saida: saidaTotal,
                                saldo: entradaTotal - saidaTotal
                            },
                            gerado_em: new Date().toISOString()
                        };
                        return [2 /*return*/, result];
                    case 3:
                        error_40 = _a.sent();
                        console.error('Erro ao gerar relatório de movimentações:', error_40);
                        throw new Error('Erro ao gerar relatório de movimentações');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInventoryReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inventories_1, inventoryCounts_1, enrichedInventories, finishedInventories, ongoingInventories, overallAccuracy, result, error_41;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getInventories()];
                    case 1:
                        inventories_1 = _a.sent();
                        return [4 /*yield*/, Promise.all(inventories_1.map(function (inv) { return _this.getInventoryCounts(inv.id); }))];
                    case 2:
                        inventoryCounts_1 = _a.sent();
                        enrichedInventories = inventories_1.map(function (inventory, index) {
                            var counts = inventoryCounts_1[index];
                            var produtosComDivergencia = counts.filter(function (c) { return c.difference !== 0; }).length;
                            var precisao = counts.length > 0 ? ((counts.length - produtosComDivergencia) / counts.length) * 100 : 100;
                            return {
                                id: inventory.id,
                                nome: inventory.name,
                                status: inventory.status === 'finalizado' ? 'FINALIZADO' : 'EM ANDAMENTO',
                                data_inicio: new Date(inventory.createdAt).toLocaleDateString('pt-BR'),
                                data_fim: inventory.finishedAt ? new Date(inventory.finishedAt).toLocaleDateString('pt-BR') : 'Em andamento',
                                total_produtos: counts.length,
                                produtos_com_divergencia: produtosComDivergencia,
                                precisao: precisao.toFixed(2) + '%',
                                responsavel: inventory.userId
                            };
                        });
                        finishedInventories = inventories_1.filter(function (i) { return i.status === 'finalizado'; }).length;
                        ongoingInventories = inventories_1.filter(function (i) { return i.status === 'em_andamento'; }).length;
                        overallAccuracy = enrichedInventories.length > 0 ?
                            enrichedInventories.reduce(function (sum, inv) { return sum + parseFloat(inv.precisao); }, 0) / enrichedInventories.length : 100;
                        result = {
                            titulo: 'Relatório de Inventários',
                            inventarios: enrichedInventories,
                            resumo: {
                                total_inventarios: inventories_1.length,
                                inventarios_finalizados: finishedInventories,
                                inventarios_andamento: ongoingInventories,
                                precisao_geral: overallAccuracy.toFixed(2) + '%'
                            },
                            gerado_em: new Date().toISOString()
                        };
                        return [2 /*return*/, result];
                    case 3:
                        error_41 = _a.sent();
                        console.error('Erro ao gerar relatório de inventários:', error_41);
                        throw new Error('Erro ao gerar relatório de inventários');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getProductsByLocationReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var products_6, locations_2, categories_4, produtosPorLocal, valorTotalGeral, totalProdutosGeral, result, error_42;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getProducts()];
                    case 1:
                        products_6 = _c.sent();
                        return [4 /*yield*/, this.getLocations()];
                    case 2:
                        locations_2 = _c.sent();
                        return [4 /*yield*/, this.getCategories()];
                    case 3:
                        categories_4 = _c.sent();
                        produtosPorLocal = locations_2.map(function (location) {
                            var locationProducts = products_6.filter(function (product) { return product.locationId === location.id; });
                            var totalValue = locationProducts.reduce(function (sum, product) {
                                var _a;
                                var price = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                                return sum + (price * product.quantity);
                            }, 0);
                            var produtosEnriquecidos = locationProducts.map(function (product) {
                                var _a;
                                var category = categories_4.find(function (c) { return c.id === product.categoryId; });
                                var unitPrice = parseFloat(((_a = product.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
                                var totalValue = unitPrice * product.quantity;
                                return {
                                    codigo: product.code || 'N/A',
                                    nome: product.name,
                                    categoria: (category === null || category === void 0 ? void 0 : category.name) || 'Sem Categoria',
                                    quantidade: product.quantity,
                                    preco_unitario: unitPrice,
                                    valor_total: totalValue,
                                    status: product.quantity <= product.minQuantity ? 'ESTOQUE BAIXO' : 'NORMAL'
                                };
                            });
                            return {
                                local: location.name,
                                descricao: location.description || 'Sem descrição',
                                produtos: produtosEnriquecidos,
                                resumo: {
                                    total_produtos: locationProducts.length,
                                    quantidade_total: locationProducts.reduce(function (sum, p) { return sum + p.quantity; }, 0),
                                    valor_total: totalValue,
                                    produtos_estoque_baixo: locationProducts.filter(function (p) { return p.quantity <= p.minQuantity; }).length
                                }
                            };
                        });
                        valorTotalGeral = produtosPorLocal.reduce(function (sum, local) { return sum + local.resumo.valor_total; }, 0);
                        totalProdutosGeral = produtosPorLocal.reduce(function (sum, local) { return sum + local.resumo.total_produtos; }, 0);
                        result = {
                            titulo: 'Relatório de Produtos por Local',
                            produtos_por_local: produtosPorLocal,
                            resumo_geral: {
                                total_locais: locations_2.length,
                                total_produtos: totalProdutosGeral,
                                valor_total_estoque: valorTotalGeral,
                                local_mais_valioso: ((_a = produtosPorLocal.sort(function (a, b) { return b.resumo.valor_total - a.resumo.valor_total; })[0]) === null || _a === void 0 ? void 0 : _a.local) || 'N/A',
                                local_mais_produtos: ((_b = produtosPorLocal.sort(function (a, b) { return b.resumo.total_produtos - a.resumo.total_produtos; })[0]) === null || _b === void 0 ? void 0 : _b.local) || 'N/A'
                            },
                            gerado_em: new Date().toISOString()
                        };
                        return [2 /*return*/, result];
                    case 4:
                        error_42 = _c.sent();
                        console.error('Erro ao gerar relatório de produtos por local:', error_42);
                        throw new Error('Erro ao gerar relatório de produtos por local');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createImportHistory = function (importData) {
        return __awaiter(this, void 0, void 0, function () {
            var id, historyData, error_43;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        historyData = {
                            id: id,
                            fileName: importData.fileName,
                            status: importData.status,
                            productsFound: importData.productsFound || 0,
                            productsCreated: importData.productsCreated || 0,
                            productsUpdated: importData.productsUpdated || 0,
                            supplier: importData.supplier || 'Fornecedor não identificado',
                            supplierCnpj: importData.supplierCnpj || '',
                            supplierAddress: importData.supplierAddress || '',
                            nfeNumber: importData.nfeNumber || '',
                            nfeKey: importData.nfeKey || '',
                            emissionDate: importData.emissionDate || new Date(),
                            totalValue: ((_a = importData.totalValue) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                            userId: importData.userId,
                            processedAt: importData.processedAt,
                            errorMessage: importData.errorMessage,
                            createdAt: new Date()
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.importHistory).values(historyData)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, historyData];
                    case 2:
                        error_43 = _b.sent();
                        console.error('Erro ao criar histórico de importação:', error_43);
                        throw error_43;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getImportHistory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_44;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.importHistory).orderBy((0, drizzle_orm_1.desc)(schema_js_1.importHistory.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_44 = _a.sent();
                        console.error('Erro ao buscar histórico de importação:', error_44);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getImportHistoryById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_45;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.importHistory).where((0, drizzle_orm_1.eq)(schema_js_1.importHistory.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_45 = _a.sent();
                        console.error('Erro ao buscar histórico de importação por ID:', error_45);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateImportHistory = function (id, importData) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, updated, error_46;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        updateData = __assign({}, importData);
                        if (importData.status === 'processado' && !updateData.processedAt) {
                            updateData.processedAt = new Date();
                        }
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.importHistory).set(updateData).where((0, drizzle_orm_1.eq)(schema_js_1.importHistory.id, id))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getImportHistoryById(id)];
                    case 2:
                        updated = _a.sent();
                        if (!updated)
                            throw new Error("Histórico de importação não encontrado");
                        return [2 /*return*/, updated];
                    case 3:
                        error_46 = _a.sent();
                        console.error('Erro ao atualizar histórico de importação:', error_46);
                        throw error_46;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteImportHistory = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_47;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.nfeProducts).where((0, drizzle_orm_1.eq)(schema_js_1.nfeProducts.importHistoryId, id))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.nfeData).where((0, drizzle_orm_1.eq)(schema_js_1.nfeData.importHistoryId, id))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.importHistory).where((0, drizzle_orm_1.eq)(schema_js_1.importHistory.id, id))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_47 = _a.sent();
                        console.error('Erro ao excluir importação:', error_47);
                        throw new Error("Erro ao excluir importação");
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createNfeProduct = function (nfeProduct) {
        return __awaiter(this, void 0, void 0, function () {
            var id, productData, error_48;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        productData = {
                            id: id,
                            importHistoryId: nfeProduct.importHistoryId,
                            productId: nfeProduct.productId,
                            nfeCode: nfeProduct.nfeCode,
                            code: nfeProduct.code || nfeProduct.nfeCode || 'N/A',
                            name: nfeProduct.name,
                            quantity: nfeProduct.quantity,
                            unitPrice: ((_a = nfeProduct.unitPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                            unit: nfeProduct.unit,
                            totalValue: ((_b = nfeProduct.totalValue) === null || _b === void 0 ? void 0 : _b.toString()) || '0',
                            nfeData: nfeProduct.nfeData || {}
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.nfeProducts).values(productData)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, productData];
                    case 2:
                        error_48 = _c.sent();
                        console.error('Erro ao criar produto NFe:', error_48);
                        throw error_48;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getNfeProductsByImport = function (importHistoryId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_49;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.nfeProducts).where((0, drizzle_orm_1.eq)(schema_js_1.nfeProducts.importHistoryId, importHistoryId))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_49 = _a.sent();
                        console.error('Erro ao buscar produtos NFe por importação:', error_49);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createNfeData = function (insertNfeData) {
        return __awaiter(this, void 0, void 0, function () {
            var id, emissionDate, data, error_50;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        emissionDate = void 0;
                        try {
                            emissionDate = new Date(insertNfeData.emissionDate);
                            if (isNaN(emissionDate.getTime())) {
                                emissionDate = new Date();
                            }
                        }
                        catch (_c) {
                            emissionDate = new Date();
                        }
                        data = {
                            id: id,
                            importHistoryId: insertNfeData.importHistoryId,
                            accessKey: insertNfeData.accessKey,
                            documentNumber: insertNfeData.documentNumber,
                            supplier: insertNfeData.supplier || {},
                            emissionDate: emissionDate,
                            totalValue: ((_a = insertNfeData.totalValue) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                            xmlContent: insertNfeData.xmlContent || '',
                            rawData: insertNfeData.rawData || {},
                            createdAt: new Date()
                        };
                        if (!data.importHistoryId) {
                            throw new Error("importHistoryId é obrigatório para criar dados NFe");
                        }
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.nfeData).values(data)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, data];
                    case 2:
                        error_50 = _b.sent();
                        console.error('Erro ao salvar dados NFe:', error_50);
                        throw new Error("Erro ao salvar dados NFe: ".concat(error_50 instanceof Error ? error_50.message : 'Erro desconhecido'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getNfeDataByImport = function (importHistoryId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_51;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.nfeData).where((0, drizzle_orm_1.eq)(schema_js_1.nfeData.importHistoryId, importHistoryId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_51 = _a.sent();
                        console.error('Erro ao buscar dados NFe por importação:', error_51);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getNfeDataByAccessKey = function (accessKey) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_52;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.nfeData).where((0, drizzle_orm_1.eq)(schema_js_1.nfeData.accessKey, accessKey))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_52 = _a.sent();
                        console.error('Erro ao buscar dados NFe por chave de acesso:', error_52);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.processNfeImport = function (fileData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var importRecord, xmlContent, nfeDataRecord, nfeError_2, savedProducts, _i, _a, product, productError_1, updatedRecord, processError_1, updateError_1, error_53;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        _o.trys.push([0, 20, , 21]);
                        importRecord = void 0;
                        _o.label = 1;
                    case 1:
                        _o.trys.push([1, 14, , 19]);
                        xmlContent = fileData.xmlContent || '';
                        return [4 /*yield*/, this.createImportHistory({
                                fileName: fileData.fileName,
                                status: 'processando',
                                productsFound: ((_b = fileData.products) === null || _b === void 0 ? void 0 : _b.length) || 0,
                                productsCreated: 0,
                                productsUpdated: 0,
                                supplier: ((_c = fileData.supplier) === null || _c === void 0 ? void 0 : _c.name) || 'Processando...',
                                supplierCnpj: ((_d = fileData.supplier) === null || _d === void 0 ? void 0 : _d.cnpj) || '',
                                supplierAddress: ((_f = (_e = fileData.supplier) === null || _e === void 0 ? void 0 : _e.address) === null || _f === void 0 ? void 0 : _f.street) || '',
                                nfeNumber: fileData.documentNumber || '...',
                                nfeKey: fileData.accessKey || '',
                                emissionDate: new Date(fileData.emissionDate || new Date()),
                                totalValue: fileData.totalValue || 0,
                                userId: userId,
                                errorMessage: null
                            })];
                    case 2:
                        importRecord = _o.sent();
                        if (!fileData.accessKey) return [3 /*break*/, 6];
                        _o.label = 3;
                    case 3:
                        _o.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.createNfeData({
                                importHistoryId: importRecord.id,
                                accessKey: fileData.accessKey,
                                documentNumber: fileData.documentNumber,
                                supplier: fileData.supplier,
                                emissionDate: new Date(fileData.emissionDate || new Date()),
                                totalValue: fileData.totalValue,
                                xmlContent: xmlContent,
                                rawData: fileData.rawData
                            })];
                    case 4:
                        nfeDataRecord = _o.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        nfeError_2 = _o.sent();
                        console.error('Erro ao criar dados NFe:', nfeError_2);
                        return [3 /*break*/, 6];
                    case 6:
                        if (!(fileData.products && fileData.products.length > 0)) return [3 /*break*/, 12];
                        savedProducts = 0;
                        _i = 0, _a = fileData.products;
                        _o.label = 7;
                    case 7:
                        if (!(_i < _a.length)) return [3 /*break*/, 12];
                        product = _a[_i];
                        _o.label = 8;
                    case 8:
                        _o.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.createNfeProduct({
                                importHistoryId: importRecord.id,
                                productId: null,
                                nfeCode: product.code,
                                code: product.code,
                                name: product.name,
                                quantity: product.quantity,
                                unitPrice: product.unitPrice,
                                unit: product.unit,
                                totalValue: product.totalValue,
                                nfeData: product
                            })];
                    case 9:
                        _o.sent();
                        savedProducts++;
                        return [3 /*break*/, 11];
                    case 10:
                        productError_1 = _o.sent();
                        console.error('Erro ao criar produto NFe:', productError_1);
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 7];
                    case 12: return [4 /*yield*/, this.updateImportHistory(importRecord.id, {
                            status: 'processado',
                            productsFound: ((_g = fileData.products) === null || _g === void 0 ? void 0 : _g.length) || 0,
                            productsCreated: ((_h = fileData.products) === null || _h === void 0 ? void 0 : _h.length) || 0,
                            productsUpdated: 0,
                            supplier: ((_j = fileData.supplier) === null || _j === void 0 ? void 0 : _j.name) || 'Fornecedor',
                            supplierCnpj: ((_k = fileData.supplier) === null || _k === void 0 ? void 0 : _k.cnpj) || '',
                            supplierAddress: ((_m = (_l = fileData.supplier) === null || _l === void 0 ? void 0 : _l.address) === null || _m === void 0 ? void 0 : _m.street) || '',
                            nfeNumber: fileData.documentNumber || '000001',
                            nfeKey: fileData.accessKey || '',
                            totalValue: fileData.totalValue || 0,
                            processedAt: new Date()
                        })];
                    case 13:
                        updatedRecord = _o.sent();
                        return [2 /*return*/, updatedRecord];
                    case 14:
                        processError_1 = _o.sent();
                        if (!importRecord) return [3 /*break*/, 18];
                        _o.label = 15;
                    case 15:
                        _o.trys.push([15, 17, , 18]);
                        return [4 /*yield*/, this.updateImportHistory(importRecord.id, {
                                status: 'erro',
                                errorMessage: processError_1 instanceof Error ? processError_1.message : 'Erro desconhecido'
                            })];
                    case 16:
                        _o.sent();
                        return [3 /*break*/, 18];
                    case 17:
                        updateError_1 = _o.sent();
                        console.error('Erro ao atualizar importação com erro:', updateError_1);
                        return [3 /*break*/, 18];
                    case 18: throw processError_1;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        error_53 = _o.sent();
                        console.error('Erro na importação:', error_53);
                        throw new Error("Erro na importa\u00E7\u00E3o: ".concat(error_53 instanceof Error ? error_53.message : 'Erro desconhecido'));
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createEmpresa = function (empresa) {
        return __awaiter(this, void 0, void 0, function () {
            var id, empresaData, error_54;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        empresaData = {
                            id: id,
                            nome: empresa.nome,
                            cnpj: empresa.cnpj,
                            email: empresa.email,
                            telefone: empresa.telefone || null,
                            website: empresa.website || null,
                            cep: empresa.cep || null,
                            logradouro: empresa.logradouro || null,
                            numero: empresa.numero || null,
                            complemento: empresa.complemento || null,
                            cidade: empresa.cidade || null,
                            estado: empresa.estado || null,
                            status: 'pendente',
                            dataAprovacao: null,
                            plano: 'starter',
                            dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.empresas).values(empresaData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, empresaData];
                    case 2:
                        error_54 = _a.sent();
                        console.error('Erro ao criar empresa:', error_54);
                        throw error_54;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEmpresa = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_55;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.empresas).where((0, drizzle_orm_1.eq)(schema_js_1.empresas.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_55 = _a.sent();
                        console.error('Erro ao buscar empresa:', error_55);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEmpresaByCnpj = function (cnpj) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_56;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.empresas).where((0, drizzle_orm_1.eq)(schema_js_1.empresas.cnpj, cnpj))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_56 = _a.sent();
                        console.error('Erro ao buscar empresa por CNPJ:', error_56);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEmpresaByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_57;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.empresas).where((0, drizzle_orm_1.eq)(schema_js_1.empresas.email, email))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_57 = _a.sent();
                        console.error('Erro ao buscar empresa por email:', error_57);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateEmpresa = function (id, empresa) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, updated, error_58;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        updateData = __assign(__assign({}, empresa), { updatedAt: new Date() });
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.empresas).set(updateData).where((0, drizzle_orm_1.eq)(schema_js_1.empresas.id, id))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getEmpresa(id)];
                    case 2:
                        updated = _a.sent();
                        if (!updated)
                            throw new Error("Empresa não encontrada");
                        return [2 /*return*/, updated];
                    case 3:
                        error_58 = _a.sent();
                        console.error('Erro ao atualizar empresa:', error_58);
                        throw error_58;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createEmailVerificacao = function (verificacao) {
        return __awaiter(this, void 0, void 0, function () {
            var id, verificacaoData, error_59;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = (0, crypto_1.randomUUID)();
                        verificacaoData = {
                            id: id,
                            userId: verificacao.userId,
                            email: verificacao.email,
                            token: verificacao.token,
                            tipo: verificacao.tipo,
                            expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            utilizado: false,
                            createdAt: new Date()
                        };
                        return [4 /*yield*/, db_js_1.db.insert(schema_js_1.emailVerificacoes).values(verificacaoData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, verificacaoData];
                    case 2:
                        error_59 = _a.sent();
                        console.error('Erro ao criar verificação de email:', error_59);
                        throw error_59;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEmailVerificacao = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_60;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.emailVerificacoes).where((0, drizzle_orm_1.eq)(schema_js_1.emailVerificacoes.token, token))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 2:
                        error_60 = _a.sent();
                        console.error('Erro ao buscar verificação de email:', error_60);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.marcarEmailComoVerificado = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, error_61;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.users).set({
                                emailVerificado: true,
                                dataVerificacao: new Date(),
                                tokenVerificacao: null
                            }).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getUser(userId)];
                    case 2:
                        updated = _a.sent();
                        if (!updated)
                            throw new Error("Usuário não encontrado");
                        return [2 /*return*/, updated];
                    case 3:
                        error_61 = _a.sent();
                        console.error('Erro ao marcar email como verificado:', error_61);
                        throw error_61;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.utilizarTokenVerificacao = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, error_62;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.emailVerificacoes).set({
                                utilizado: true
                            }).where((0, drizzle_orm_1.eq)(schema_js_1.emailVerificacoes.token, token))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getEmailVerificacao(token)];
                    case 2:
                        updated = _a.sent();
                        if (!updated)
                            throw new Error("Token não encontrado");
                        return [2 /*return*/, updated];
                    case 3:
                        error_62 = _a.sent();
                        console.error('Erro ao utilizar token de verificação:', error_62);
                        throw error_62;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.cadastrarUsuarioIndividual = function (dados) {
        return __awaiter(this, void 0, void 0, function () {
            var isAdmin, usuarioExistente, adminExistente, baseUsername, username, counter, user, token, error_63;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        isAdmin = dados.email === 'admin@neuropsicocentro.com';
                        if (!!isAdmin) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getUserByEmail(dados.email)];
                    case 1:
                        usuarioExistente = _a.sent();
                        if (usuarioExistente) {
                            throw new Error("Já existe um usuário com este email");
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getUserByEmail(dados.email)];
                    case 3:
                        adminExistente = _a.sent();
                        if (adminExistente) {
                            throw new Error("Usuário admin já existe");
                        }
                        _a.label = 4;
                    case 4:
                        baseUsername = dados.nome.toLowerCase().replace(/\s+/g, '.');
                        username = baseUsername;
                        counter = 1;
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.getUserByUsername(username)];
                    case 6:
                        if (!_a.sent()) return [3 /*break*/, 7];
                        username = "".concat(baseUsername).concat(counter);
                        counter++;
                        if (counter > 10)
                            return [3 /*break*/, 7];
                        return [3 /*break*/, 5];
                    case 7: return [4 /*yield*/, this.createUser({
                            username: username,
                            password: dados.senha,
                            name: dados.nome,
                            email: dados.email,
                            tipo: 'individual',
                            role: isAdmin ? 'super_admin' : 'user',
                            emailVerificado: isAdmin
                        })];
                    case 8:
                        user = _a.sent();
                        token = isAdmin ? 'admin-auto-verified' : (0, crypto_1.randomUUID)();
                        if (!!isAdmin) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.createEmailVerificacao({
                                userId: user.id,
                                email: user.email,
                                token: token,
                                tipo: 'cadastro'
                            })];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/, { user: user, token: token }];
                    case 11:
                        error_63 = _a.sent();
                        console.error('Erro ao cadastrar usuário individual:', error_63);
                        throw error_63;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.cadastrarEmpresa = function (dados) {
        return __awaiter(this, void 0, void 0, function () {
            var empresaExistente, emailEmpresaExistente, adminExistente, empresa, baseUsername, username, counter, admin, token, error_64;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, this.getEmpresaByCnpj(dados.empresaCnpj)];
                    case 1:
                        empresaExistente = _a.sent();
                        if (empresaExistente) {
                            throw new Error("Já existe uma empresa cadastrada com este CNPJ");
                        }
                        return [4 /*yield*/, this.getEmpresaByEmail(dados.empresaEmail)];
                    case 2:
                        emailEmpresaExistente = _a.sent();
                        if (emailEmpresaExistente) {
                            throw new Error("Já existe uma empresa cadastrada com este email");
                        }
                        return [4 /*yield*/, this.getUserByEmail(dados.adminEmail)];
                    case 3:
                        adminExistente = _a.sent();
                        if (adminExistente) {
                            throw new Error("Já existe um usuário com este email de administrador");
                        }
                        return [4 /*yield*/, this.createEmpresa({
                                nome: dados.empresaNome,
                                cnpj: dados.empresaCnpj,
                                email: dados.empresaEmail,
                                telefone: dados.empresaTelefone,
                                website: dados.empresaWebsite,
                                cep: dados.empresaCep,
                                logradouro: dados.empresaLogradouro,
                                numero: dados.empresaNumero,
                                complemento: dados.empresaComplemento,
                                cidade: dados.empresaCidade,
                                estado: dados.empresaEstado
                            })];
                    case 4:
                        empresa = _a.sent();
                        baseUsername = dados.adminNome.toLowerCase().replace(/\s+/g, '.');
                        username = baseUsername;
                        counter = 1;
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.getUserByUsername(username)];
                    case 6:
                        if (!_a.sent()) return [3 /*break*/, 7];
                        username = "".concat(baseUsername).concat(counter);
                        counter++;
                        if (counter > 10)
                            return [3 /*break*/, 7];
                        return [3 /*break*/, 5];
                    case 7: return [4 /*yield*/, this.createUser({
                            username: username,
                            password: dados.adminSenha,
                            name: dados.adminNome,
                            email: dados.adminEmail,
                            tipo: 'empresa',
                            role: 'admin',
                            empresaId: empresa.id
                        })];
                    case 8:
                        admin = _a.sent();
                        token = (0, crypto_1.randomUUID)();
                        return [4 /*yield*/, this.createEmailVerificacao({
                                userId: admin.id,
                                email: admin.email,
                                token: token,
                                tipo: 'cadastro'
                            })];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, { empresa: empresa, admin: admin, token: token }];
                    case 10:
                        error_64 = _a.sent();
                        console.error('Erro ao cadastrar empresa:', error_64);
                        throw error_64;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUsersByEmpresa = function (empresaId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_65;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.empresaId, empresaId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        error_65 = _a.sent();
                        console.error('Erro ao buscar usuários por empresa:', error_65);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEmpresaUsers = function (empresaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getUsersByEmpresa(empresaId)];
            });
        });
    };
    DatabaseStorage.prototype.createUserForEmpresa = function (userData, empresaId, createdBy) {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, baseUsername, username, counter, user, token, error_66;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.getUserByEmail(userData.email)];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser) {
                            throw new Error("Já existe um usuário com este email");
                        }
                        baseUsername = userData.name.toLowerCase().replace(/\s+/g, '.');
                        username = baseUsername;
                        counter = 1;
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.getUserByUsername(username)];
                    case 3:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        username = "".concat(baseUsername).concat(counter);
                        counter++;
                        if (counter > 10)
                            return [3 /*break*/, 4];
                        return [3 /*break*/, 2];
                    case 4: return [4 /*yield*/, this.createUser({
                            username: username,
                            password: userData.password || '123456',
                            name: userData.name,
                            email: userData.email,
                            tipo: 'empresa',
                            role: userData.role || 'user',
                            empresaId: empresaId,
                            emailVerificado: false
                        })];
                    case 5:
                        user = _a.sent();
                        token = (0, crypto_1.randomUUID)();
                        return [4 /*yield*/, this.createEmailVerificacao({
                                userId: user.id,
                                email: user.email,
                                token: token,
                                tipo: 'cadastro'
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, user];
                    case 7:
                        error_66 = _a.sent();
                        console.error('Erro ao criar usuário para empresa:', error_66);
                        throw error_66;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUserRole = function (userId, role) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, error_67;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_js_1.db.update(schema_js_1.users).set({ role: role }).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getUser(userId)];
                    case 2:
                        updated = _a.sent();
                        if (!updated)
                            throw new Error("Usuário não encontrado");
                        return [2 /*return*/, updated];
                    case 3:
                        error_67 = _a.sent();
                        console.error('Erro ao atualizar role do usuário:', error_67);
                        throw error_67;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, emailError_1, error_68;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.getUser(userId)];
                    case 1:
                        currentUser = _a.sent();
                        if (!currentUser) {
                            throw new Error("Usuário não encontrado");
                        }
                        if (currentUser.role === 'super_admin') {
                            throw new Error("Não é possível deletar um Super Admin");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db_js_1.db.delete(schema_js_1.emailVerificacoes).where((0, drizzle_orm_1.eq)(schema_js_1.emailVerificacoes.userId, userId))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        emailError_1 = _a.sent();
                        console.error('Erro ao deletar verificações de email:', emailError_1);
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, db_js_1.db.delete(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_68 = _a.sent();
                        console.error('Erro ao deletar usuário:', error_68);
                        throw error_68;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.canUserAccessModule = function (userId, module) {
        return __awaiter(this, void 0, void 0, function () {
            var user, permissions, userPermissions, error_69;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getUser(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, false];
                        permissions = {
                            'super_admin': {
                                produtos: ['view', 'create', 'edit', 'delete'],
                                usuarios: ['view', 'create', 'edit', 'delete'],
                                relatorios: ['view', 'create', 'export'],
                                configuracoes: ['view', 'edit'],
                                importacao: ['view', 'create', 'delete'],
                                movimentacoes: ['view', 'create', 'edit', 'delete'],
                                inventarios: ['view', 'create', 'edit', 'delete']
                            },
                            'admin': {
                                produtos: ['view', 'create', 'edit', 'delete'],
                                usuarios: ['view', 'create', 'edit'],
                                relatorios: ['view', 'create', 'export'],
                                configuracoes: ['view'],
                                importacao: ['view', 'create', 'delete'],
                                movimentacoes: ['view', 'create', 'edit', 'delete'],
                                inventarios: ['view', 'create', 'edit', 'delete']
                            },
                            'user': {
                                produtos: ['view'],
                                usuarios: [],
                                relatorios: ['view'],
                                configuracoes: [],
                                importacao: ['view'],
                                movimentacoes: ['view', 'create'],
                                inventarios: ['view']
                            }
                        };
                        userPermissions = permissions[user.role];
                        return [2 /*return*/, userPermissions && module in userPermissions && userPermissions[module].length > 0];
                    case 2:
                        error_69 = _a.sent();
                        console.error('Erro ao verificar permissões:', error_69);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, permissions, error_70;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getUser(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, {}];
                        permissions = {
                            'super_admin': {
                                dashboard: { view: true, edit: true },
                                produtos: { view: true, create: true, edit: true, delete: true },
                                categorias: { view: true, create: true, edit: true, delete: true },
                                locais: { view: true, create: true, edit: true, delete: true },
                                movimentacoes: { view: true, create: true, edit: true, delete: true },
                                inventarios: { view: true, create: true, edit: true, delete: true },
                                relatorios: { view: true, create: true, export: true },
                                importacao: { view: true, create: true, delete: true },
                                usuarios: { view: true, create: true, edit: true, delete: true },
                                configuracoes: { view: true, edit: true },
                                empresas: { view: true, create: true, edit: true, delete: true }
                            },
                            'admin': {
                                dashboard: { view: true, edit: true },
                                produtos: { view: true, create: true, edit: true, delete: true },
                                categorias: { view: true, create: true, edit: true, delete: true },
                                locais: { view: true, create: true, edit: true, delete: true },
                                movimentacoes: { view: true, create: true, edit: true, delete: true },
                                inventarios: { view: true, create: true, edit: true, delete: true },
                                relatorios: { view: true, create: true, export: true },
                                importacao: { view: true, create: true, delete: true },
                                usuarios: { view: true, create: true, edit: true },
                                configuracoes: { view: true, edit: false },
                                empresas: { view: false, create: false, edit: false, delete: false }
                            },
                            'user': {
                                dashboard: { view: true, edit: false },
                                produtos: { view: true, create: false, edit: false, delete: false },
                                categorias: { view: true, create: false, edit: false, delete: false },
                                locais: { view: true, create: false, edit: false, delete: false },
                                movimentacoes: { view: true, create: true, edit: false, delete: false },
                                inventarios: { view: true, create: false, edit: false, delete: false },
                                relatorios: { view: true, create: false, export: false },
                                importacao: { view: true, create: false, delete: false },
                                usuarios: { view: false, create: false, edit: false, delete: false },
                                configuracoes: { view: false, edit: false },
                                empresas: { view: false, create: false, edit: false, delete: false }
                            }
                        };
                        return [2 /*return*/, permissions[user.role] || {}];
                    case 2:
                        error_70 = _a.sent();
                        console.error('Erro ao buscar permissões do usuário:', error_70);
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseStorage;
}());
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
console.log('✅ DatabaseStorage instance created and ready');
