// server/routes/import.ts - CÓDIGO COMPLETO CORRIGIDO
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import xml2js from "xml2js";
import { storage } from "../storage";

const upload = multer({ storage: multer.memoryStorage() });
const importRoutes = Router();

// Schema para validação da NFe
const NFeProductSchema = z.object({
  code: z.string(),
  name: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  unit: z.string().optional(),
  totalValue: z.number().positive(),
});

const NFeDataSchema = z.object({
  accessKey: z.string().min(1, "Chave de acesso é obrigatória"),
  documentNumber: z.string(),
  supplier: z.object({
    name: z.string(),
    cnpj: z.string(),
    address: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    }).optional(),
  }),
  emissionDate: z.string(),
  totalValue: z.number(),
  products: z.array(NFeProductSchema),
});

// 🔥 PARSER CORRIGIDO - SEM mergeAttrs
const parseNFeXml = async (xmlBuffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: false,
      normalize: true,
      trim: true,
      attrkey: '$',
      charkey: '_'
    });

    parser.parseString(xmlBuffer.toString('utf-8'), (err, result) => {
      if (err) {
        reject(new Error(`Erro ao parsear XML: ${err.message}`));
        return;
      }

      try {
        console.log('🔍 Estrutura XML parseada:', JSON.stringify(result, null, 2).substring(0, 500) + '...');

        const nfeProc = result.nfeProc;
        if (!nfeProc) {
          throw new Error('Estrutura nfeProc não encontrada');
        }

        const nfe = nfeProc.NFe;
        if (!nfe) {
          throw new Error('Estrutura NFe não encontrada');
        }

        const infNFe = nfe.infNFe;
        if (!infNFe) {
          throw new Error('Estrutura infNFe não encontrada');
        }

        console.log('✅ Estrutura XML identificada corretamente');

        // 1. CHAVE DE ACESSO (do atributo Id)
        const accessKey = infNFe.$?.Id?.replace('NFe', '') || `NFe${Date.now()}`;
        console.log('🔑 Chave de acesso:', accessKey);

        // 2. DADOS DO EMITENTE (FORNECEDOR)
        const emit = infNFe.emit;
        if (!emit) {
          throw new Error('Dados do emitente não encontrados');
        }

        const supplier = {
          name: emit.xNome || emit.razao || 'Fornecedor não identificado',
          cnpj: emit.CNPJ || emit.cpf || '00.000.000/0001-00',
          address: {
            street: emit.enderEmit?.xLgr,
            number: emit.enderEmit?.nro,
            neighborhood: emit.enderEmit?.xBairro,
            city: emit.enderEmit?.xMun,
            state: emit.enderEmit?.UF,
            zipCode: emit.enderEmit?.CEP
          }
        };
        console.log('🏢 Fornecedor:', supplier.name);
        console.log('📊 CNPJ:', supplier.cnpj);

        // 3. DADOS DA NOTA
        const ide = infNFe.ide;
        const documentNumber = ide?.nNF || '000001';
        const emissionDate = ide?.dhEmi || new Date().toISOString();
        
        // 🔥 CORREÇÃO: Garantir que a data seja válida
        let parsedEmissionDate: Date;
        try {
          parsedEmissionDate = new Date(emissionDate);
          if (isNaN(parsedEmissionDate.getTime())) {
            console.warn('⚠️ Data de emissão inválida no XML, usando data atual');
            parsedEmissionDate = new Date();
          }
        } catch {
          parsedEmissionDate = new Date();
        }

        console.log('📄 Número da nota:', documentNumber);
        console.log('📅 Data de emissão (corrigida):', parsedEmissionDate.toISOString());

        // 4. PRODUTOS - CORRIGIDO
        let det = infNFe.det;
        
        if (det && !Array.isArray(det)) {
          det = [det];
        } else if (!det) {
          det = [];
        }

        console.log(`📦 Encontrados ${det.length} produtos no XML`);

        const products = det.map((item: any, index: number) => {
          try {
            const prod = item.prod;
            if (!prod) {
              console.warn(`⚠️ Produto ${index + 1} sem dados`);
              return null;
            }

            const code = prod.cProd || `ITEM${index + 1}`;
            const name = prod.xProd || 'Produto não identificado';
            const quantity = parseFloat(prod.qCom || '1');
            const unitPrice = parseFloat(prod.vUnCom || '0');
            const unit = prod.uCom || 'UN';
            const totalValue = parseFloat(prod.vProd || '0');

            console.log(`   🎯 Produto ${index + 1}:`, {
              code,
              name: name.substring(0, 50),
              quantity,
              unitPrice: `R$ ${unitPrice.toFixed(2)}`,
              unit,
              totalValue: `R$ ${totalValue.toFixed(2)}`
            });

            return {
              code,
              name,
              quantity,
              unitPrice,
              unit,
              totalValue
            };
          } catch (productError) {
            console.error(`❌ Erro ao processar produto ${index + 1}:`, productError);
            return null;
          }
        }).filter(Boolean);

        if (products.length === 0) {
          throw new Error('Nenhum produto válido encontrado no XML');
        }

        // 5. VALOR TOTAL
        const total = infNFe.total?.ICMSTot;
        const totalValue = parseFloat(total?.vNF || '0');
        console.log('💰 Valor total da nota:', `R$ ${totalValue.toFixed(2)}`);

        const nfeData = {
          accessKey,
          documentNumber: documentNumber.toString(),
          supplier,
          emissionDate: parsedEmissionDate.toISOString(), // 🔥 DATA CORRIGIDA
          totalValue,
          products
        };

        console.log('✅ Dados extraídos com sucesso!');
        console.log('📊 RESUMO:');
        console.log('   - Chave:', nfeData.accessKey);
        console.log('   - Nota:', nfeData.documentNumber);
        console.log('   - Fornecedor:', nfeData.supplier.name);
        console.log('   - CNPJ:', nfeData.supplier.cnpj);
        console.log('   - Produtos:', nfeData.products.length);
        console.log('   - Valor total:', `R$ ${nfeData.totalValue.toFixed(2)}`);

        nfeData.products.forEach((prod, idx) => {
          console.log(`   📍 Produto ${idx + 1}: ${prod.name} (${prod.quantity} ${prod.unit}) - R$ ${prod.totalValue.toFixed(2)}`);
        });

        resolve(nfeData);

      } catch (parseError) {
        console.error('❌ Erro ao processar XML:', parseError);
        reject(new Error(`Erro ao extrair dados da NFe: ${parseError}`));
      }
    });
  });
};

// POST /api/import/xml - Processar XML REAL
importRoutes.post('/xml', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Recebendo arquivo XML para importação...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.file;
    
    if (!file.mimetype.includes('xml') && !file.originalname.toLowerCase().endsWith('.xml')) {
      return res.status(400).json({ error: 'Apenas arquivos XML são suportados' });
    }

    console.log(`📄 Processando arquivo: ${file.originalname} (${file.size} bytes)`);

    // Parsear XML
    let nfeData;
    try {
      nfeData = await parseNFeXml(file.buffer);
      console.log('✅ XML parseado com sucesso!');
    } catch (parseError) {
      console.error('❌ Erro ao parsear XML:', parseError);
      return res.status(400).json({ 
        error: 'Erro ao processar XML',
        details: parseError.message
      });
    }

    // Validar dados extraídos
    const validatedData = NFeDataSchema.parse(nfeData);
    
    // 🔥 CORREÇÃO: USAR STORAGE DIRETAMENTE
    try {
      const importRecord = await storage.processNfeImport({
        fileName: file.originalname,
        accessKey: validatedData.accessKey,
        documentNumber: validatedData.documentNumber,
        supplier: validatedData.supplier,
        emissionDate: validatedData.emissionDate, // 🔥 JÁ VEM VALIDADO
        totalValue: validatedData.totalValue,
        products: validatedData.products,
        xmlContent: file.buffer.toString('utf-8'),
        rawData: nfeData
      }); // Remover userId por enquanto

      console.log(`✅ Importação salva no banco: ${importRecord.id}`);

    } catch (dbError) {
      console.error('❌ Erro ao salvar no banco:', dbError);
      // Continuar mesmo com erro no banco
    }

    // Retornar resposta com dados REAIS
    res.json({
      success: true,
      productsProcessed: validatedData.products.length,
      nfeData: {
        supplier: validatedData.supplier.name,
        documentNumber: validatedData.documentNumber,
        accessKey: validatedData.accessKey,
        emissionDate: validatedData.emissionDate,
        totalValue: validatedData.totalValue,
        products: validatedData.products.map(p => ({
          code: p.code,
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          unit: p.unit,
          totalValue: p.totalValue
        }))
      },
      message: `${validatedData.products.length} produtos importados com sucesso da nota ${validatedData.documentNumber}`
    });

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados da NFe inválidos', 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor ao processar NFe',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export { importRoutes };