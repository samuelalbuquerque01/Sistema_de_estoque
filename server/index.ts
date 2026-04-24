import dotenv from "dotenv";
dotenv.config();

import app, { attachStaticClient } from "./app";
import { migrate } from "./migrate";

const port = parseInt(process.env.PORT || "5000", 10);
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
const shouldAutoMigrate =
  process.env.ENABLE_AUTO_MIGRATE === "true" ||
  (process.env.ENABLE_AUTO_MIGRATE !== "false" && process.env.NODE_ENV !== "production");

async function bootstrap() {
  console.log("Iniciando Sistema de Estoque Server...");

  if (shouldAutoMigrate) {
    console.log("Executando migracao automatica do banco de dados...");
    try {
      await migrate();
      console.log("Migracao automatica concluida.");
    } catch (error) {
      console.error("Erro na migracao automatica:", error);
    }
  } else {
    console.log("Migracao automatica desabilitada para este ambiente.");
  }

  attachStaticClient(app);

  app.listen(port, host, () => {
    console.log(`Sistema de Estoque rodando em http://${host}:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Health check: http://${host}:${port}/api/health`);
  });
}

void bootstrap();
