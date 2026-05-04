import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../server/app.ts";

function buildQueryString(url: URL): string {
  const params = new URLSearchParams(url.search);
  params.delete("route");
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = new URL(req.url || "/api", "http://localhost");
  const route = requestUrl.searchParams.get("route");

  if (route) {
    req.url = `/api/${route}${buildQueryString(requestUrl)}`;
  }

  return app(req as any, res as any);
}
