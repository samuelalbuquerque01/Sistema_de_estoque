import type { IncomingMessage, ServerResponse } from "node:http";

function buildQueryString(url: URL): string {
  const params = new URLSearchParams(url.search);
  params.delete("route");
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const requestUrl = new URL(req.url || "/api", "http://localhost");
    const route = requestUrl.searchParams.get("route");

    if (route) {
      req.url = `/api/${route}${buildQueryString(requestUrl)}`;
    }

    const appPaths = [
      new URL("../server/app.js", import.meta.url).href,
      new URL("../server/app.ts", import.meta.url).href,
      new URL("../server/app", import.meta.url).href,
    ];

    let app;
    let lastError: unknown;

    for (const path of appPaths) {
      try {
        console.log('📦 Trying server app import path:', path);
        const module = await import(path);
        app = module.default;
        break;
      } catch (err) {
        console.warn('⚠️ Failed to import server app from:', path, 'error:', err instanceof Error ? err.message : err);
        lastError = err;
      }
    }

    if (!app) {
      throw lastError;
    }

    return app(req as any, res as any);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "API bootstrap failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    );
  }
}
