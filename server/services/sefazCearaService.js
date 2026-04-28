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
exports.downloadNfeXmlFromSefazCe = downloadNfeXmlFromSefazCe;
var fs_1 = require("fs");
var https_1 = require("https");
var zlib_1 = require("zlib");
var xml2js_1 = require("xml2js");
var PROD_ENDPOINT = "https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";
var HOMOLOG_ENDPOINT = "https://hom.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";
var SOAP_ACTION = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe/nfeDistDFeInteresse";
var readIfExists = function (path) {
    if (!path)
        return undefined;
    if (!fs_1.default.existsSync(path))
        return undefined;
    return fs_1.default.readFileSync(path);
};
var readBase64 = function (value) {
    if (!value)
        return undefined;
    return Buffer.from(value, "base64");
};
var loadCertConfig = function () {
    var _a, _b, _c, _d;
    var pfxPath = process.env.SEFAZ_CERT_PFX_PATH;
    var certPath = process.env.SEFAZ_CERT_CRT_PATH;
    var keyPath = process.env.SEFAZ_CERT_KEY_PATH;
    var caPath = process.env.SEFAZ_CERT_CA_PATH;
    return {
        pfx: (_a = readBase64(process.env.SEFAZ_CERT_PFX_BASE64)) !== null && _a !== void 0 ? _a : readIfExists(pfxPath),
        passphrase: process.env.SEFAZ_CERT_PFX_PASSPHRASE,
        cert: (_b = readBase64(process.env.SEFAZ_CERT_CRT_BASE64)) !== null && _b !== void 0 ? _b : readIfExists(certPath),
        key: (_c = readBase64(process.env.SEFAZ_CERT_KEY_BASE64)) !== null && _c !== void 0 ? _c : readIfExists(keyPath),
        ca: (_d = readBase64(process.env.SEFAZ_CERT_CA_BASE64)) !== null && _d !== void 0 ? _d : readIfExists(caPath),
    };
};
var isConfigured = function () {
    var cert = loadCertConfig();
    var hasPfx = Boolean(cert.pfx);
    var hasCrtKey = Boolean(cert.cert && cert.key);
    var hasTaxId = Boolean(process.env.SEFAZ_CNPJ || process.env.SEFAZ_CPF);
    return (hasPfx || hasCrtKey) && hasTaxId;
};
var buildEnvelope = function (accessKey) {
    var _a, _b;
    var ambiente = process.env.SEFAZ_AMBIENTE === "2" ? "2" : "1";
    var cnpj = (_a = process.env.SEFAZ_CNPJ) === null || _a === void 0 ? void 0 : _a.replace(/\D/g, "");
    var cpf = (_b = process.env.SEFAZ_CPF) === null || _b === void 0 ? void 0 : _b.replace(/\D/g, "");
    var autorTag = cnpj
        ? "<CNPJ>".concat(cnpj, "</CNPJ>")
        : cpf
            ? "<CPF>".concat(cpf, "</CPF>")
            : "";
    if (!autorTag) {
        throw new Error("Configure SEFAZ_CNPJ ou SEFAZ_CPF para consultar a SEFAZ.");
    }
    var distDfe = "<distDFeInt xmlns=\"http://www.portalfiscal.inf.br/nfe\" versao=\"1.01\"><tpAmb>".concat(ambiente, "</tpAmb><cUFAutor>23</cUFAutor>").concat(autorTag, "<consChNFe><chNFe>").concat(accessKey, "</chNFe></consChNFe></distDFeInt>");
    return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n                 xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"\n                 xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">\n  <soap12:Body>\n    <nfeDistDFeInteresse xmlns=\"http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe\">\n      <nfeDadosMsg>".concat(distDfe, "</nfeDadosMsg>\n    </nfeDistDFeInteresse>\n  </soap12:Body>\n</soap12:Envelope>");
};
var postSoap = function (endpoint, body) {
    return new Promise(function (resolve, reject) {
        var cert = loadCertConfig();
        var url = new URL(endpoint);
        var req = https_1.default.request({
            protocol: url.protocol,
            hostname: url.hostname,
            port: Number(url.port) || 443,
            path: url.pathname + url.search,
            method: "POST",
            headers: {
                "Content-Type": "application/soap+xml; charset=utf-8",
                SOAPAction: SOAP_ACTION,
                "Content-Length": Buffer.byteLength(body, "utf8"),
            },
            pfx: cert.pfx,
            cert: cert.cert,
            key: cert.key,
            ca: cert.ca,
            passphrase: cert.passphrase,
            rejectUnauthorized: true,
        }, function (res) {
            var chunks = [];
            res.on("data", function (chunk) { return chunks.push(Buffer.from(chunk)); });
            res.on("end", function () {
                var _a;
                var content = Buffer.concat(chunks).toString("utf8");
                if (((_a = res.statusCode) !== null && _a !== void 0 ? _a : 500) >= 400) {
                    reject(new Error("SEFAZ retornou HTTP ".concat(res.statusCode, ": ").concat(content.slice(0, 600))));
                    return;
                }
                resolve(content);
            });
        });
        req.on("error", function (error) { return reject(error); });
        req.write(body);
        req.end();
    });
};
var extractDocZip = function (soapResponse) { return __awaiter(void 0, void 0, void 0, function () {
    var parser, parsed, body, resultNode, retDist, _a, ret, cStat, xMotivo, lot, docZip, encoded, zippedBuffer, xmlBuffer;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    return __generator(this, function (_r) {
        switch (_r.label) {
            case 0:
                parser = new xml2js_1.default.Parser({
                    explicitArray: false,
                    trim: true,
                    attrkey: "$",
                    charkey: "_",
                });
                return [4 /*yield*/, parser.parseStringPromise(soapResponse)];
            case 1:
                parsed = _r.sent();
                body = (_e = (_c = (_b = parsed === null || parsed === void 0 ? void 0 : parsed["soap:Envelope"]) === null || _b === void 0 ? void 0 : _b["soap:Body"]) !== null && _c !== void 0 ? _c : (_d = parsed === null || parsed === void 0 ? void 0 : parsed["soap12:Envelope"]) === null || _d === void 0 ? void 0 : _d["soap12:Body"]) !== null && _e !== void 0 ? _e : (_f = parsed === null || parsed === void 0 ? void 0 : parsed.Envelope) === null || _f === void 0 ? void 0 : _f.Body;
                resultNode = (_k = (_h = (_g = body === null || body === void 0 ? void 0 : body.nfeDistDFeInteresseResponse) === null || _g === void 0 ? void 0 : _g.nfeDistDFeInteresseResult) !== null && _h !== void 0 ? _h : (_j = body === null || body === void 0 ? void 0 : body["nfeDistDFeInteresseResponse"]) === null || _j === void 0 ? void 0 : _j["nfeDistDFeInteresseResult"]) !== null && _k !== void 0 ? _k : body === null || body === void 0 ? void 0 : body.nfeDistDFeInteresseResult;
                if (!resultNode) {
                    throw new Error("Resposta da SEFAZ sem nfeDistDFeInteresseResult.");
                }
                if (!(typeof resultNode === "string")) return [3 /*break*/, 3];
                return [4 /*yield*/, parser.parseStringPromise(resultNode)];
            case 2:
                _a = _r.sent();
                return [3 /*break*/, 4];
            case 3:
                _a = resultNode;
                _r.label = 4;
            case 4:
                retDist = _a;
                ret = (_l = retDist === null || retDist === void 0 ? void 0 : retDist.retDistDFeInt) !== null && _l !== void 0 ? _l : retDist;
                cStat = String((_m = ret === null || ret === void 0 ? void 0 : ret.cStat) !== null && _m !== void 0 ? _m : "");
                xMotivo = String((_o = ret === null || ret === void 0 ? void 0 : ret.xMotivo) !== null && _o !== void 0 ? _o : "");
                if (!["138", "139", "140"].includes(cStat)) {
                    throw new Error("SEFAZ nao autorizou download. cStat=".concat(cStat, " motivo=").concat(xMotivo));
                }
                lot = ret === null || ret === void 0 ? void 0 : ret.loteDistDFeInt;
                docZip = lot === null || lot === void 0 ? void 0 : lot.docZip;
                if (!docZip) {
                    throw new Error("SEFAZ nao retornou XML para a chave informada. cStat=".concat(cStat, " motivo=").concat(xMotivo));
                }
                if (Array.isArray(docZip)) {
                    docZip = docZip[0];
                }
                encoded = typeof docZip === "string" ? docZip : String((_p = docZip === null || docZip === void 0 ? void 0 : docZip._) !== null && _p !== void 0 ? _p : "");
                if (!encoded) {
                    throw new Error("docZip vazio na resposta da SEFAZ.");
                }
                zippedBuffer = Buffer.from(encoded, "base64");
                try {
                    xmlBuffer = (0, zlib_1.gunzipSync)(zippedBuffer);
                }
                catch (_s) {
                    xmlBuffer = zippedBuffer;
                }
                return [2 /*return*/, {
                        xml: xmlBuffer.toString("utf8"),
                        schema: typeof docZip === "string" ? undefined : (_q = docZip === null || docZip === void 0 ? void 0 : docZip.$) === null || _q === void 0 ? void 0 : _q.schema,
                    }];
        }
    });
}); };
function downloadNfeXmlFromSefazCe(accessKey) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, envelope, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isConfigured()) {
                        throw new Error("Integracao SEFAZ nao configurada. Defina certificado digital e SEFAZ_CNPJ/SEFAZ_CPF no .env.");
                    }
                    endpoint = process.env.SEFAZ_AMBIENTE === "2" ? HOMOLOG_ENDPOINT : PROD_ENDPOINT;
                    envelope = buildEnvelope(accessKey);
                    return [4 /*yield*/, postSoap(endpoint, envelope)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, extractDocZip(response)];
            }
        });
    });
}
