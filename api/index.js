"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
var app_ts_1 = require("../server/app.ts");
function buildQueryString(url) {
    var params = new URLSearchParams(url.search);
    params.delete("route");
    var serialized = params.toString();
    return serialized ? "?".concat(serialized) : "";
}
function handler(req, res) {
    var requestUrl = new URL(req.url || "/api", "http://localhost");
    var route = requestUrl.searchParams.get("route");
    if (route) {
        req.url = "/api/".concat(route).concat(buildQueryString(requestUrl));
    }
    return (0, app_ts_1.default)(req, res);
}
