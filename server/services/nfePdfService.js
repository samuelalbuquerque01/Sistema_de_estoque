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
exports.generateNfePdfFromXml = generateNfePdfFromXml;
var pdfkit_1 = require("pdfkit");
var nfeXmlService_js_1 = require("./nfeXmlService.js");
function generateNfePdfFromXml(xmlContent) {
    return __awaiter(this, void 0, void 0, function () {
        var nfe;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, nfeXmlService_js_1.parseNfeXml)(xmlContent)];
                case 1:
                    nfe = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve) {
                            var doc = new pdfkit_1.default({ margin: 40, size: "A4" });
                            var chunks = [];
                            doc.on("data", function (chunk) { return chunks.push(Buffer.from(chunk)); });
                            doc.on("end", function () { return resolve(Buffer.concat(chunks)); });
                            doc.fontSize(16).text("NOTA FISCAL ELETRONICA", { align: "center" });
                            doc.moveDown(0.8);
                            doc.fontSize(10).text("Chave de acesso: ".concat(nfe.accessKey));
                            doc.text("Numero: ".concat(nfe.documentNumber));
                            doc.text("Emissao: ".concat(new Date(nfe.emissionDate).toLocaleString("pt-BR")));
                            doc.text("Fornecedor: ".concat(nfe.supplier.name));
                            doc.text("CNPJ/CPF: ".concat(nfe.supplier.cnpj || "Nao informado"));
                            doc.text("Total: ".concat(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(nfe.totalValue)));
                            doc.moveDown(1);
                            doc.fontSize(12).text("Produtos");
                            doc.moveDown(0.4);
                            doc.fontSize(9);
                            nfe.products.slice(0, 35).forEach(function (product, index) {
                                var value = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.totalValue);
                                doc.text("".concat(index + 1, ". ").concat(product.code, " - ").concat(product.name, " | ").concat(product.quantity, " ").concat(product.unit, " | ").concat(value));
                            });
                            if (nfe.products.length > 35) {
                                doc.moveDown(0.4);
                                doc.text("... e mais ".concat(nfe.products.length - 35, " item(ns)."));
                            }
                            doc.moveDown(1);
                            doc.fontSize(8).fillColor("#555").text("Documento gerado pelo sistema de estoque.", { align: "right" });
                            doc.end();
                        })];
            }
        });
    });
}
