"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
exports.attachStaticClient = attachStaticClient;
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var path_1 = require("path");
var fs_1 = require("fs");
var index_js_1 = require("./routes/index.js");
function createApp() {
    var app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    (0, index_js_1.registerRoutes)(app);
    return app;
}
function attachStaticClient(app) {
    var staticPath = path_1.default.join(process.cwd(), "dist", "public");
    if (!fs_1.default.existsSync(staticPath)) {
        console.warn("Build do frontend nao encontrado em ".concat(staticPath, "."));
        return;
    }
    app.use(express_1.default.static(staticPath));
    app.get("*", function (req, res) {
        if (req.path.startsWith("/api/")) {
            return res.status(404).json({
                error: "Endpoint da API nao encontrado",
                path: req.path,
                message: "Verifique se a rota esta registrada corretamente",
            });
        }
        res.sendFile(path_1.default.join(staticPath, "index.html"));
    });
}
var app = createApp();
exports.default = app;
