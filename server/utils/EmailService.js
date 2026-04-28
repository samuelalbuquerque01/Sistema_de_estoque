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
exports.EmailService = void 0;
var resend_1 = require("resend");
var EmailService = /** @class */ (function () {
    function EmailService() {
    }
    EmailService.getClient = function () {
        var apiKey = process.env.RESEND_API_KEY;
        return apiKey ? new resend_1.Resend(apiKey) : null;
    };
    EmailService.getBaseUrl = function () {
        var _a, _b, _c;
        var appUrl = (_a = process.env.APP_URL) === null || _a === void 0 ? void 0 : _a.trim();
        if (appUrl) {
            return appUrl.replace(/\/$/, "");
        }
        var productionUrl = (_b = process.env.VERCEL_PROJECT_PRODUCTION_URL) === null || _b === void 0 ? void 0 : _b.trim();
        if (productionUrl) {
            return "https://".concat(productionUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""));
        }
        var previewUrl = (_c = process.env.VERCEL_URL) === null || _c === void 0 ? void 0 : _c.trim();
        if (previewUrl) {
            return "https://".concat(previewUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""));
        }
        return "http://localhost:5173";
    };
    EmailService.initialize = function () {
        console.log("EmailService inicializado");
    };
    EmailService.enviarEmailVerificacao = function (email, nome, token) {
        return __awaiter(this, void 0, void 0, function () {
            var verificationUrl, resend, from, error, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        verificationUrl = "".concat(this.getBaseUrl(), "/verificar-email?token=").concat(encodeURIComponent(token));
                        resend = this.getClient();
                        if (!resend) {
                            console.log("[SIMULACAO] RESEND_API_KEY nao configurada. Link de verificacao para ".concat(email, ": ").concat(verificationUrl));
                            return [2 /*return*/, true];
                        }
                        from = process.env.EMAIL_FROM || "Sistema de Estoque <onboarding@resend.dev>";
                        return [4 /*yield*/, resend.emails.send({
                                from: from,
                                to: email,
                                subject: "Verifique seu email - Sistema de Estoque",
                                html: "\n          <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n            <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;\">\n              <h1 style=\"margin: 0;\">Sistema de Estoque</h1>\n              <p style=\"margin: 10px 0 0 0;\">Sistema de Gestao de Estoque</p>\n            </div>\n\n            <div style=\"padding: 30px; background: white;\">\n              <h2 style=\"color: #333;\">Ola, ".concat(nome, "!</h2>\n              <p style=\"color: #555; line-height: 1.6;\">\n                Para ativar sua conta, clique no botao abaixo:\n              </p>\n\n              <div style=\"text-align: center; margin: 30px 0;\">\n                <a href=\"").concat(verificationUrl, "\"\n                   style=\"background: #667eea; color: white; padding: 15px 30px;\n                          text-decoration: none; border-radius: 5px; display: inline-block;\n                          font-weight: bold;\">\n                  Verificar Email\n                </a>\n              </div>\n\n              <p style=\"color: #777; font-size: 14px;\">\n                <strong>Link de verificacao:</strong><br>\n                <span style=\"word-break: break-all;\">").concat(verificationUrl, "</span>\n              </p>\n\n              <div style=\"background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;\">\n                <p style=\"margin: 0; color: #856404; font-size: 14px;\">\n                  <strong>Este link expira em 24 horas.</strong>\n                </p>\n              </div>\n            </div>\n          </div>\n        "),
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.log("Erro ao enviar email de verificacao:", error.message);
                            return [2 /*return*/, false];
                        }
                        console.log("Email de verificacao enviado para ".concat(email));
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        console.log("Erro critico ao enviar email de verificacao:", error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.enviarEmailBoasVindas = function (email, nome) {
        return __awaiter(this, void 0, void 0, function () {
            var resend, from, error, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        resend = this.getClient();
                        if (!resend) {
                            console.log("[SIMULACAO] Email de boas-vindas para ".concat(nome, " (").concat(email, ")"));
                            return [2 /*return*/, true];
                        }
                        from = process.env.EMAIL_FROM || "Sistema de Estoque <onboarding@resend.dev>";
                        return [4 /*yield*/, resend.emails.send({
                                from: from,
                                to: email,
                                subject: "Conta ativada com sucesso",
                                html: "\n          <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n            <h1 style=\"color: #222;\">Conta ativada</h1>\n            <p>Ola, ".concat(nome, ".</p>\n            <p>Sua conta foi verificada e ja pode ser usada normalmente.</p>\n            <p><a href=\"").concat(this.getBaseUrl(), "\">Acessar o sistema</a></p>\n          </div>\n        "),
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.log("Erro ao enviar email de boas-vindas:", error.message);
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 2:
                        error_2 = _a.sent();
                        console.log("Erro ao enviar email de boas-vindas:", error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.getStatus = function () {
        var configured = Boolean(process.env.RESEND_API_KEY);
        return {
            service: "resend",
            status: configured ? "configurado" : "simulacao",
            from: process.env.EMAIL_FROM || "Sistema de Estoque <onboarding@resend.dev>",
            baseUrl: this.getBaseUrl(),
            note: configured
                ? "Envio real habilitado via Resend."
                : "RESEND_API_KEY nao configurada; os emails sao apenas registrados no log.",
        };
    };
    return EmailService;
}());
exports.EmailService = EmailService;
