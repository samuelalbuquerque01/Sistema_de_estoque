import fs from "fs";
import https from "https";
import { gunzipSync } from "zlib";
import xml2js from "xml2js";

type CertConfig = {
  pfx?: Buffer;
  passphrase?: string;
  cert?: Buffer;
  key?: Buffer;
  ca?: Buffer;
};

type DownloadResult = {
  xml: string;
  schema?: string;
};

const PROD_ENDPOINT = "https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";
const HOMOLOG_ENDPOINT = "https://hom.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";
const SOAP_ACTION = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe/nfeDistDFeInteresse";

const readIfExists = (path: string | undefined): Buffer | undefined => {
  if (!path) return undefined;
  if (!fs.existsSync(path)) return undefined;
  return fs.readFileSync(path);
};

const loadCertConfig = (): CertConfig => {
  const pfxPath = process.env.SEFAZ_CERT_PFX_PATH;
  const certPath = process.env.SEFAZ_CERT_CRT_PATH;
  const keyPath = process.env.SEFAZ_CERT_KEY_PATH;
  const caPath = process.env.SEFAZ_CERT_CA_PATH;

  return {
    pfx: readIfExists(pfxPath),
    passphrase: process.env.SEFAZ_CERT_PFX_PASSPHRASE,
    cert: readIfExists(certPath),
    key: readIfExists(keyPath),
    ca: readIfExists(caPath),
  };
};

const isConfigured = (): boolean => {
  const cert = loadCertConfig();
  const hasPfx = Boolean(cert.pfx);
  const hasCrtKey = Boolean(cert.cert && cert.key);
  const hasTaxId = Boolean(process.env.SEFAZ_CNPJ || process.env.SEFAZ_CPF);
  return (hasPfx || hasCrtKey) && hasTaxId;
};

const buildEnvelope = (accessKey: string): string => {
  const ambiente = process.env.SEFAZ_AMBIENTE === "2" ? "2" : "1";
  const cnpj = process.env.SEFAZ_CNPJ?.replace(/\D/g, "");
  const cpf = process.env.SEFAZ_CPF?.replace(/\D/g, "");
  const autorTag = cnpj
    ? `<CNPJ>${cnpj}</CNPJ>`
    : cpf
      ? `<CPF>${cpf}</CPF>`
      : "";

  if (!autorTag) {
    throw new Error("Configure SEFAZ_CNPJ ou SEFAZ_CPF para consultar a SEFAZ.");
  }

  const distDfe = `<distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01"><tpAmb>${ambiente}</tpAmb><cUFAutor>23</cUFAutor>${autorTag}<consChNFe><chNFe>${accessKey}</chNFe></consChNFe></distDFeInt>`;

  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">
      <nfeDadosMsg>${distDfe}</nfeDadosMsg>
    </nfeDistDFeInteresse>
  </soap12:Body>
</soap12:Envelope>`;
};

const postSoap = (endpoint: string, body: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const cert = loadCertConfig();
    const url = new URL(endpoint);

    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: Number(url.port) || 443,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/soap+xml; charset=utf-8",
          SOAPAction: SOAP_ACTION,
          "Content-Length": Buffer.byteLength(body, "utf8"),
        },
        pfx: cert.pfx,
        cert: cert.cert,
        key: cert.key,
        ca: cert.ca,
        passphrase: cert.passphrase,
        rejectUnauthorized: true,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          const content = Buffer.concat(chunks).toString("utf8");
          if ((res.statusCode ?? 500) >= 400) {
            reject(new Error(`SEFAZ retornou HTTP ${res.statusCode}: ${content.slice(0, 600)}`));
            return;
          }
          resolve(content);
        });
      },
    );

    req.on("error", (error) => reject(error));
    req.write(body);
    req.end();
  });

const extractDocZip = async (soapResponse: string): Promise<DownloadResult> => {
  const parser = new xml2js.Parser({
    explicitArray: false,
    trim: true,
    attrkey: "$",
    charkey: "_",
  });

  const parsed = await parser.parseStringPromise(soapResponse);
  const body = parsed?.["soap:Envelope"]?.["soap:Body"] ?? parsed?.["soap12:Envelope"]?.["soap12:Body"] ?? parsed?.Envelope?.Body;
  const resultNode =
    body?.nfeDistDFeInteresseResponse?.nfeDistDFeInteresseResult ??
    body?.["nfeDistDFeInteresseResponse"]?.["nfeDistDFeInteresseResult"] ??
    body?.nfeDistDFeInteresseResult;

  if (!resultNode) {
    throw new Error("Resposta da SEFAZ sem nfeDistDFeInteresseResult.");
  }

  const retDist = typeof resultNode === "string"
    ? await parser.parseStringPromise(resultNode)
    : resultNode;

  const ret = retDist?.retDistDFeInt ?? retDist;
  const cStat = String(ret?.cStat ?? "");
  const xMotivo = String(ret?.xMotivo ?? "");

  if (!["138", "139", "140"].includes(cStat)) {
    throw new Error(`SEFAZ nao autorizou download. cStat=${cStat} motivo=${xMotivo}`);
  }

  const lot = ret?.loteDistDFeInt;
  let docZip = lot?.docZip;
  if (!docZip) {
    throw new Error(`SEFAZ nao retornou XML para a chave informada. cStat=${cStat} motivo=${xMotivo}`);
  }

  if (Array.isArray(docZip)) {
    docZip = docZip[0];
  }

  const encoded = typeof docZip === "string" ? docZip : String(docZip?._ ?? "");
  if (!encoded) {
    throw new Error("docZip vazio na resposta da SEFAZ.");
  }

  const zippedBuffer = Buffer.from(encoded, "base64");

  let xmlBuffer: Buffer;
  try {
    xmlBuffer = gunzipSync(zippedBuffer);
  } catch {
    xmlBuffer = zippedBuffer;
  }

  return {
    xml: xmlBuffer.toString("utf8"),
    schema: typeof docZip === "string" ? undefined : docZip?.$?.schema,
  };
};

export async function downloadNfeXmlFromSefazCe(accessKey: string): Promise<DownloadResult> {
  if (!isConfigured()) {
    throw new Error(
      "Integracao SEFAZ nao configurada. Defina certificado digital e SEFAZ_CNPJ/SEFAZ_CPF no .env.",
    );
  }

  const endpoint = process.env.SEFAZ_AMBIENTE === "2" ? HOMOLOG_ENDPOINT : PROD_ENDPOINT;
  const envelope = buildEnvelope(accessKey);
  const response = await postSoap(endpoint, envelope);
  return extractDocZip(response);
}

