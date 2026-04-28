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
exports.importRoutes = void 0;
var express_1 = require("express");
var multer_1 = require("multer");
var zod_1 = require("zod");
var storage_js_1 = require("../storage.js");
var nfeXmlService_js_1 = require("../services/nfeXmlService.js");
var upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
var importRoutes = (0, express_1.Router)();
exports.importRoutes = importRoutes;
var rawXmlSchema = zod_1.z.object({
    xmlContent: zod_1.z.string().min(50, "Conteudo XML muito curto."),
    fileName: zod_1.z.string().optional(),
});
var importNfe = function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var nfeData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, nfeXmlService_js_1.parseNfeXml)(params.xmlContent)];
            case 1:
                nfeData = _a.sent();
                return [4 /*yield*/, storage_js_1.storage.processNfeImport({
                        fileName: params.fileName,
                        accessKey: nfeData.accessKey,
                        documentNumber: nfeData.documentNumber,
                        supplier: nfeData.supplier,
                        emissionDate: nfeData.emissionDate,
                        totalValue: nfeData.totalValue,
                        products: nfeData.products,
                        xmlContent: params.xmlContent,
                        rawData: nfeData,
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, nfeData];
        }
    });
}); };
importRoutes.post("/xml", upload.single("file"), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var file, xmlContent, nfeData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                file = req.file;
                if (!file) {
                    return [2 /*return*/, res.status(400).json({ error: "Nenhum arquivo enviado." })];
                }
                if (!file.originalname.toLowerCase().endsWith(".xml")) {
                    return [2 /*return*/, res.status(400).json({ error: "Apenas arquivos XML sao suportados." })];
                }
                xmlContent = file.buffer.toString("utf8");
                return [4 /*yield*/, importNfe({
                        fileName: file.originalname,
                        xmlContent: xmlContent,
                    })];
            case 1:
                nfeData = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        productsProcessed: nfeData.products.length,
                        nfeData: {
                            supplier: nfeData.supplier.name,
                            documentNumber: nfeData.documentNumber,
                            accessKey: nfeData.accessKey,
                            emissionDate: nfeData.emissionDate,
                            totalValue: nfeData.totalValue,
                            products: nfeData.products,
                        },
                        message: "".concat(nfeData.products.length, " produto(s) importado(s) da nota ").concat(nfeData.documentNumber, "."),
                    })];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, res.status(400).json({
                        error: "Erro ao processar XML da NF-e.",
                        message: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
importRoutes.post("/raw-xml", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, xmlContent, fileName, nfeData, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = rawXmlSchema.parse(req.body), xmlContent = _a.xmlContent, fileName = _a.fileName;
                return [4 /*yield*/, importNfe({
                        fileName: (fileName === null || fileName === void 0 ? void 0 : fileName.trim()) || "xml_colado_".concat(Date.now(), ".xml"),
                        xmlContent: xmlContent,
                    })];
            case 1:
                nfeData = _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        productsProcessed: nfeData.products.length,
                        nfeData: {
                            supplier: nfeData.supplier.name,
                            documentNumber: nfeData.documentNumber,
                            accessKey: nfeData.accessKey,
                            emissionDate: nfeData.emissionDate,
                            totalValue: nfeData.totalValue,
                            products: nfeData.products,
                        },
                        message: "XML colado importado com sucesso.",
                    })];
            case 2:
                error_2 = _b.sent();
                if (error_2 instanceof zod_1.z.ZodError) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Dados invalidos para importacao.",
                            details: error_2.errors,
                        })];
                }
                return [2 /*return*/, res.status(400).json({
                        error: "Erro ao processar XML colado.",
                        message: error_2 instanceof Error ? error_2.message : "Erro desconhecido",
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
