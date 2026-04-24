import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cors());
  app.use(helmet());

  registerRoutes(app);

  return app;
}

export function attachStaticClient(app: Express): void {
  const staticPath = path.join(process.cwd(), "dist", "public");

  if (!fs.existsSync(staticPath)) {
    console.warn(`Build do frontend nao encontrado em ${staticPath}.`);
    return;
  }

  app.use(express.static(staticPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({
        error: "Endpoint da API nao encontrado",
        path: req.path,
        message: "Verifique se a rota esta registrada corretamente",
      });
    }

    res.sendFile(path.join(staticPath, "index.html"));
  });
}

const app = createApp();

export default app;
