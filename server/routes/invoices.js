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
exports.invoiceRoutes = void 0;
var express_1 = require("express");
var zod_1 = require("zod");
var storage_js_1 = require("../storage.js");
var sefazCearaService_js_1 = require("../services/sefazCearaService.js");
var nfePdfService_js_1 = require("../services/nfePdfService.js");
var invoiceRoutes = (0, express_1.Router)();
exports.invoiceRoutes = invoiceRoutes;
var DownloadRequestSchema = zod_1.z.object({
    nfeKey: zod_1.z.string().length(44, "Chave de acesso deve ter 44 caracteres."),
    format: zod_1.z.enum(["xml", "pdf"]).default("xml"),
});
var resolveXmlForKey = function (nfeKey) { return __awaiter(void 0, void 0, void 0, function () {
    var local, sefazResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_js_1.storage.getNfeDataByAccessKey(nfeKey)];
            case 1:
                local = _a.sent();
                if ((local === null || local === void 0 ? void 0 : local.xmlContent) && local.xmlContent.trim().length > 0) {
                    return [2 /*return*/, { xml: local.xmlContent, source: "database" }];
                }
                return [4 /*yield*/, (0, sefazCearaService_js_1.downloadNfeXmlFromSefazCe)(nfeKey)];
            case 2:
                sefazResult = _a.sent();
                return [2 /*return*/, { xml: sefazResult.xml, source: "sefaz-ce" }];
        }
    });
}); };
invoiceRoutes.post("/download", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, nfeKey, format, _b, xml, source, pdfBuffer, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = DownloadRequestSchema.parse(req.body), nfeKey = _a.nfeKey, format = _a.format;
                return [4 /*yield*/, resolveXmlForKey(nfeKey)];
            case 1:
                _b = _c.sent(), xml = _b.xml, source = _b.source;
                if (!(format === "pdf")) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, nfePdfService_js_1.generateNfePdfFromXml)(xml)];
            case 2:
                pdfBuffer = _c.sent();
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("X-Download-Source", source);
                res.setHeader("Content-Disposition", "attachment; filename=\"nota_fiscal_".concat(nfeKey, ".pdf\""));
                return [2 /*return*/, res.send(pdfBuffer)];
            case 3:
                res.setHeader("Content-Type", "application/xml; charset=utf-8");
                res.setHeader("X-Download-Source", source);
                res.setHeader("Content-Disposition", "attachment; filename=\"nota_fiscal_".concat(nfeKey, ".xml\""));
                return [2 /*return*/, res.send(xml)];
            case 4:
                error_1 = _c.sent();
                if (error_1 instanceof zod_1.z.ZodError) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Dados invalidos para download.",
                            details: error_1.errors,
                        })];
                }
                return [2 /*return*/, res.status(502).json({
                        error: "Nao foi possivel obter a NF-e para download local.",
                        message: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); });
invoiceRoutes.get("/sefaz/config-status", function (_req, res) {
    var hasCert = Boolean(process.env.SEFAZ_CERT_PFX_BASE64) ||
        (Boolean(process.env.SEFAZ_CERT_CRT_BASE64) && Boolean(process.env.SEFAZ_CERT_KEY_BASE64)) ||
        Boolean(process.env.SEFAZ_CERT_PFX_PATH) ||
        (Boolean(process.env.SEFAZ_CERT_CRT_PATH) && Boolean(process.env.SEFAZ_CERT_KEY_PATH));
    var hasTaxId = Boolean(process.env.SEFAZ_CNPJ || process.env.SEFAZ_CPF);
    return res.json({
        configured: hasCert && hasTaxId,
        ambiente: process.env.SEFAZ_AMBIENTE === "2" ? "homologacao" : "producao",
        ufAutor: "CE",
        checks: {
            cert: hasCert,
            taxId: hasTaxId,
        },
    });
});
