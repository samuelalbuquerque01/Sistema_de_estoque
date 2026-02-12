import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { storage } from "../storage";
import { parseNfeXml } from "../services/nfeXmlService";

const upload = multer({ storage: multer.memoryStorage() });
const importRoutes = Router();

const rawXmlSchema = z.object({
  xmlContent: z.string().min(50, "Conteudo XML muito curto."),
  fileName: z.string().optional(),
});

const importNfe = async (params: { fileName: string; xmlContent: string }) => {
  const nfeData = await parseNfeXml(params.xmlContent);

  await storage.processNfeImport({
    fileName: params.fileName,
    accessKey: nfeData.accessKey,
    documentNumber: nfeData.documentNumber,
    supplier: nfeData.supplier,
    emissionDate: nfeData.emissionDate,
    totalValue: nfeData.totalValue,
    products: nfeData.products,
    xmlContent: params.xmlContent,
    rawData: nfeData,
  });

  return nfeData;
};

importRoutes.post("/xml", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    if (!file.originalname.toLowerCase().endsWith(".xml")) {
      return res.status(400).json({ error: "Apenas arquivos XML sao suportados." });
    }

    const xmlContent = file.buffer.toString("utf8");
    const nfeData = await importNfe({
      fileName: file.originalname,
      xmlContent,
    });

    return res.json({
      success: true,
      productsProcessed: nfeData.products.length,
      nfeData: {
        supplier: nfeData.supplier.name,
        documentNumber: nfeData.documentNumber,
        accessKey: nfeData.accessKey,
        emissionDate: nfeData.emissionDate,
        totalValue: nfeData.totalValue,
        products: nfeData.products,
      },
      message: `${nfeData.products.length} produto(s) importado(s) da nota ${nfeData.documentNumber}.`,
    });
  } catch (error) {
    return res.status(400).json({
      error: "Erro ao processar XML da NF-e.",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

importRoutes.post("/raw-xml", async (req, res) => {
  try {
    const { xmlContent, fileName } = rawXmlSchema.parse(req.body);
    const nfeData = await importNfe({
      fileName: fileName?.trim() || `xml_colado_${Date.now()}.xml`,
      xmlContent,
    });

    return res.json({
      success: true,
      productsProcessed: nfeData.products.length,
      nfeData: {
        supplier: nfeData.supplier.name,
        documentNumber: nfeData.documentNumber,
        accessKey: nfeData.accessKey,
        emissionDate: nfeData.emissionDate,
        totalValue: nfeData.totalValue,
        products: nfeData.products,
      },
      message: "XML colado importado com sucesso.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados invalidos para importacao.",
        details: error.errors,
      });
    }

    return res.status(400).json({
      error: "Erro ao processar XML colado.",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

export { importRoutes };
