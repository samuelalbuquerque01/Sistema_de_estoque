import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { downloadNfeXmlFromSefazCe } from "../services/sefazCearaService";
import { generateNfePdfFromXml } from "../services/nfePdfService";

const invoiceRoutes = Router();

const DownloadRequestSchema = z.object({
  nfeKey: z.string().length(44, "Chave de acesso deve ter 44 caracteres."),
  format: z.enum(["xml", "pdf"]).default("xml"),
});

const resolveXmlForKey = async (nfeKey: string): Promise<{ xml: string; source: "database" | "sefaz-ce" }> => {
  const local = await storage.getNfeDataByAccessKey(nfeKey);
  if (local?.xmlContent && local.xmlContent.trim().length > 0) {
    return { xml: local.xmlContent, source: "database" };
  }

  const sefazResult = await downloadNfeXmlFromSefazCe(nfeKey);
  return { xml: sefazResult.xml, source: "sefaz-ce" };
};

invoiceRoutes.post("/download", async (req, res) => {
  try {
    const { nfeKey, format } = DownloadRequestSchema.parse(req.body);
    const { xml, source } = await resolveXmlForKey(nfeKey);

    if (format === "pdf") {
      const pdfBuffer = await generateNfePdfFromXml(xml);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("X-Download-Source", source);
      res.setHeader("Content-Disposition", `attachment; filename="nota_fiscal_${nfeKey}.pdf"`);
      return res.send(pdfBuffer);
    }

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("X-Download-Source", source);
    res.setHeader("Content-Disposition", `attachment; filename="nota_fiscal_${nfeKey}.xml"`);
    return res.send(xml);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados invalidos para download.",
        details: error.errors,
      });
    }

    return res.status(502).json({
      error: "Nao foi possivel obter a NF-e para download local.",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

invoiceRoutes.get("/sefaz/config-status", (_req, res) => {
  const hasCert =
    Boolean(process.env.SEFAZ_CERT_PFX_PATH) ||
    (Boolean(process.env.SEFAZ_CERT_CRT_PATH) && Boolean(process.env.SEFAZ_CERT_KEY_PATH));
  const hasTaxId = Boolean(process.env.SEFAZ_CNPJ || process.env.SEFAZ_CPF);

  return res.json({
    configured: hasCert && hasTaxId,
    ambiente: process.env.SEFAZ_AMBIENTE === "2" ? "homologacao" : "producao",
    ufAutor: "CE",
    checks: {
      cert: hasCert,
      taxId: hasTaxId,
    },
  });
});

export { invoiceRoutes };
