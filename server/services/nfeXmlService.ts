import xml2js from "xml2js";

export type ParsedNfeProduct = {
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  totalValue: number;
};

export type ParsedNfeData = {
  accessKey: string;
  documentNumber: string;
  supplier: {
    name: string;
    cnpj: string;
    address?: {
      street?: string;
      number?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  };
  emissionDate: string;
  totalValue: number;
  products: ParsedNfeProduct[];
};

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value !== "string") return fallback;

  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseDateIso = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

const pickInfNfe = (root: any): any => {
  const nfeProc = root?.nfeProc;
  const nfe = nfeProc?.NFe ?? root?.NFe;
  const infNFe = nfe?.infNFe;

  if (!infNFe) {
    throw new Error("Estrutura infNFe nao encontrada no XML.");
  }

  return infNFe;
};

export async function parseNfeXml(xmlContent: string | Buffer): Promise<ParsedNfeData> {
  const xmlString = Buffer.isBuffer(xmlContent) ? xmlContent.toString("utf-8") : xmlContent;

  const parser = new xml2js.Parser({
    explicitArray: false,
    trim: true,
    normalize: true,
    attrkey: "$",
    charkey: "_",
  });

  const parsed = await parser.parseStringPromise(xmlString);
  const infNFe = pickInfNfe(parsed);

  const accessKey = String(infNFe?.$?.Id ?? "")
    .replace("NFe", "")
    .trim();

  if (accessKey.length !== 44) {
    throw new Error("Chave de acesso da NF-e invalida no XML.");
  }

  const emit = infNFe?.emit ?? {};
  const ide = infNFe?.ide ?? {};

  let det = infNFe?.det ?? [];
  if (!Array.isArray(det)) {
    det = [det];
  }

  const products: ParsedNfeProduct[] = det
    .map((item: any, index: number): ParsedNfeProduct | null => {
      const prod = item?.prod;
      if (!prod) return null;

      const code = String(prod.cProd ?? `ITEM${index + 1}`).trim();
      const name = String(prod.xProd ?? "Produto nao identificado").trim();
      const quantity = parseNumber(prod.qCom, 0);
      const unitPrice = parseNumber(prod.vUnCom, 0);
      const unit = String(prod.uCom ?? "UN").trim();
      const totalValue = parseNumber(prod.vProd, quantity * unitPrice);

      if (quantity <= 0 || unitPrice < 0 || totalValue < 0) {
        return null;
      }

      return { code, name, quantity, unitPrice, unit, totalValue };
    })
    .filter((product): product is ParsedNfeProduct => Boolean(product));

  if (products.length === 0) {
    throw new Error("Nenhum produto valido encontrado no XML da NF-e.");
  }

  const totalValue = parseNumber(infNFe?.total?.ICMSTot?.vNF, 0);

  return {
    accessKey,
    documentNumber: String(ide?.nNF ?? "").trim() || "000000",
    supplier: {
      name: String(emit?.xNome ?? "Fornecedor nao identificado").trim(),
      cnpj: String(emit?.CNPJ ?? emit?.CPF ?? "").trim(),
      address: {
        street: emit?.enderEmit?.xLgr,
        number: emit?.enderEmit?.nro,
        neighborhood: emit?.enderEmit?.xBairro,
        city: emit?.enderEmit?.xMun,
        state: emit?.enderEmit?.UF,
        zipCode: emit?.enderEmit?.CEP,
      },
    },
    emissionDate: parseDateIso(ide?.dhEmi ?? ide?.dEmi),
    totalValue,
    products,
  };
}

