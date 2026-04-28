"use strict";
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
exports.parseNfeXml = parseNfeXml;
var xml2js_1 = require("xml2js");
var parseNumber = function (value, fallback) {
    if (fallback === void 0) { fallback = 0; }
    if (typeof value === "number")
        return Number.isFinite(value) ? value : fallback;
    if (typeof value !== "string")
        return fallback;
    var normalized = value.trim().replace(",", ".");
    var parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
};
var parseDateIso = function (value) {
    if (typeof value !== "string" || value.trim().length === 0) {
        return new Date().toISOString();
    }
    var parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return new Date().toISOString();
    }
    return parsed.toISOString();
};
var pickInfNfe = function (root) {
    var _a;
    var nfeProc = root === null || root === void 0 ? void 0 : root.nfeProc;
    var nfe = (_a = nfeProc === null || nfeProc === void 0 ? void 0 : nfeProc.NFe) !== null && _a !== void 0 ? _a : root === null || root === void 0 ? void 0 : root.NFe;
    var infNFe = nfe === null || nfe === void 0 ? void 0 : nfe.infNFe;
    if (!infNFe) {
        throw new Error("Estrutura infNFe nao encontrada no XML.");
    }
    return infNFe;
};
function parseNfeXml(xmlContent) {
    return __awaiter(this, void 0, void 0, function () {
        var xmlString, parser, parsed, infNFe, accessKey, emit, ide, det, products, totalValue;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        return __generator(this, function (_u) {
            switch (_u.label) {
                case 0:
                    xmlString = Buffer.isBuffer(xmlContent) ? xmlContent.toString("utf-8") : xmlContent;
                    parser = new xml2js_1.default.Parser({
                        explicitArray: false,
                        trim: true,
                        normalize: true,
                        attrkey: "$",
                        charkey: "_",
                    });
                    return [4 /*yield*/, parser.parseStringPromise(xmlString)];
                case 1:
                    parsed = _u.sent();
                    infNFe = pickInfNfe(parsed);
                    accessKey = String((_b = (_a = infNFe === null || infNFe === void 0 ? void 0 : infNFe.$) === null || _a === void 0 ? void 0 : _a.Id) !== null && _b !== void 0 ? _b : "")
                        .replace("NFe", "")
                        .trim();
                    if (accessKey.length !== 44) {
                        throw new Error("Chave de acesso da NF-e invalida no XML.");
                    }
                    emit = (_c = infNFe === null || infNFe === void 0 ? void 0 : infNFe.emit) !== null && _c !== void 0 ? _c : {};
                    ide = (_d = infNFe === null || infNFe === void 0 ? void 0 : infNFe.ide) !== null && _d !== void 0 ? _d : {};
                    det = (_e = infNFe === null || infNFe === void 0 ? void 0 : infNFe.det) !== null && _e !== void 0 ? _e : [];
                    if (!Array.isArray(det)) {
                        det = [det];
                    }
                    products = det
                        .map(function (item, index) {
                        var _a, _b, _c;
                        var prod = item === null || item === void 0 ? void 0 : item.prod;
                        if (!prod)
                            return null;
                        var code = String((_a = prod.cProd) !== null && _a !== void 0 ? _a : "ITEM".concat(index + 1)).trim();
                        var name = String((_b = prod.xProd) !== null && _b !== void 0 ? _b : "Produto nao identificado").trim();
                        var quantity = parseNumber(prod.qCom, 0);
                        var unitPrice = parseNumber(prod.vUnCom, 0);
                        var unit = String((_c = prod.uCom) !== null && _c !== void 0 ? _c : "UN").trim();
                        var totalValue = parseNumber(prod.vProd, quantity * unitPrice);
                        if (quantity <= 0 || unitPrice < 0 || totalValue < 0) {
                            return null;
                        }
                        return { code: code, name: name, quantity: quantity, unitPrice: unitPrice, unit: unit, totalValue: totalValue };
                    })
                        .filter(function (product) { return Boolean(product); });
                    if (products.length === 0) {
                        throw new Error("Nenhum produto valido encontrado no XML da NF-e.");
                    }
                    totalValue = parseNumber((_g = (_f = infNFe === null || infNFe === void 0 ? void 0 : infNFe.total) === null || _f === void 0 ? void 0 : _f.ICMSTot) === null || _g === void 0 ? void 0 : _g.vNF, 0);
                    return [2 /*return*/, {
                            accessKey: accessKey,
                            documentNumber: String((_h = ide === null || ide === void 0 ? void 0 : ide.nNF) !== null && _h !== void 0 ? _h : "").trim() || "000000",
                            supplier: {
                                name: String((_j = emit === null || emit === void 0 ? void 0 : emit.xNome) !== null && _j !== void 0 ? _j : "Fornecedor nao identificado").trim(),
                                cnpj: String((_l = (_k = emit === null || emit === void 0 ? void 0 : emit.CNPJ) !== null && _k !== void 0 ? _k : emit === null || emit === void 0 ? void 0 : emit.CPF) !== null && _l !== void 0 ? _l : "").trim(),
                                address: {
                                    street: (_m = emit === null || emit === void 0 ? void 0 : emit.enderEmit) === null || _m === void 0 ? void 0 : _m.xLgr,
                                    number: (_o = emit === null || emit === void 0 ? void 0 : emit.enderEmit) === null || _o === void 0 ? void 0 : _o.nro,
                                    neighborhood: (_p = emit === null || emit === void 0 ? void 0 : emit.enderEmit) === null || _p === void 0 ? void 0 : _p.xBairro,
                                    city: (_q = emit === null || emit === void 0 ? void 0 : emit.enderEmit) === null || _q === void 0 ? void 0 : _q.xMun,
                                    state: (_r = emit === null || emit === void 0 ? void 0 : emit.enderEmit) === null || _r === void 0 ? void 0 : _r.UF,
                                    zipCode: (_s = emit === null || emit === void 0 ? void 0 : emit.enderEmit) === null || _s === void 0 ? void 0 : _s.CEP,
                                },
                            },
                            emissionDate: parseDateIso((_t = ide === null || ide === void 0 ? void 0 : ide.dhEmi) !== null && _t !== void 0 ? _t : ide === null || ide === void 0 ? void 0 : ide.dEmi),
                            totalValue: totalValue,
                            products: products,
                        }];
            }
        });
    });
}
