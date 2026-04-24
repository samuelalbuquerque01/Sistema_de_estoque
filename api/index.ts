import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../server/app";

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
