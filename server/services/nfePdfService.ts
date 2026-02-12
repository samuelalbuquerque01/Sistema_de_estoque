import PDFDocument from "pdfkit";
import { parseNfeXml } from "./nfeXmlService";

export async function generateNfePdfFromXml(xmlContent: string): Promise<Buffer> {
  const nfe = await parseNfeXml(xmlContent);

  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(16).text("NOTA FISCAL ELETRONICA", { align: "center" });
    doc.moveDown(0.8);
    doc.fontSize(10).text(`Chave de acesso: ${nfe.accessKey}`);
    doc.text(`Numero: ${nfe.documentNumber}`);
    doc.text(`Emissao: ${new Date(nfe.emissionDate).toLocaleString("pt-BR")}`);
    doc.text(`Fornecedor: ${nfe.supplier.name}`);
    doc.text(`CNPJ/CPF: ${nfe.supplier.cnpj || "Nao informado"}`);
    doc.text(
      `Total: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(nfe.totalValue)}`,
    );

    doc.moveDown(1);
    doc.fontSize(12).text("Produtos");
    doc.moveDown(0.4);
    doc.fontSize(9);

    nfe.products.slice(0, 35).forEach((product, index) => {
      const value = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.totalValue);
      doc.text(`${index + 1}. ${product.code} - ${product.name} | ${product.quantity} ${product.unit} | ${value}`);
    });

    if (nfe.products.length > 35) {
      doc.moveDown(0.4);
      doc.text(`... e mais ${nfe.products.length - 35} item(ns).`);
    }

    doc.moveDown(1);
    doc.fontSize(8).fillColor("#555").text("Documento gerado pelo sistema de estoque.", { align: "right" });

    doc.end();
  });
}

