// Importacao.tsx - Versão com Download da SEFAZ
import { useState } from "react";
import { Upload, FileText, Check, X, Download, Package, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ImportHistory {
  id: string;
  fileName: string;
  status: 'processado' | 'erro' | 'processando';
  productsFound: number;
  supplier: string;
  nfeNumber: string;
  nfeKey: string; // Chave de acesso da NFe
  date: Date;
}

export default function Importacao() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast.error('Apenas arquivos XML de nota fiscal são suportados');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/xml', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        const newImport: ImportHistory = {
          id: Date.now().toString(),
          fileName: file.name,
          status: 'processado',
          productsFound: result.productsProcessed,
          supplier: result.nfeData.supplier,
          nfeNumber: result.nfeData.documentNumber,
          nfeKey: result.nfeData.accessKey, // Chave de acesso para SEFAZ
          date: new Date(),
        };

        setImportHistory(prev => [newImport, ...prev]);
        toast.success(`${result.productsProcessed} produtos importados da nota fiscal ${result.nfeData.documentNumber}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar nota fiscal');
      }
    } catch (error) {
      const failedImport: ImportHistory = {
        id: Date.now().toString(),
        fileName: file.name,
        status: 'erro',
        productsFound: 0,
        supplier: 'N/A',
        nfeNumber: 'N/A',
        nfeKey: '',
        date: new Date(),
      };

      setImportHistory(prev => [failedImport, ...prev]);
      toast.error(`Erro na importação: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔥 FUNÇÃO PARA BAIXAR DA SEFAZ
  const downloadFromSefaz = async (nfeKey: string, fileName: string) => {
    try {
      const response = await fetch(`/api/invoices/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nfeKey }),
      });

      if (response.ok) {
        const blob = await response.blob();
        
        // Verificar se é um PDF ou XML
        const contentType = response.headers.get('content-type');
        const extension = contentType?.includes('pdf') ? 'pdf' : 'xml';
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nota_fiscal_${nfeKey}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Nota fiscal baixada da SEFAZ');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao baixar da SEFAZ');
      }
    } catch (error) {
      toast.error(`Erro ao baixar: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    }
  };

  // 🔥 FUNÇÃO PARA ABRIR CONSULTA PÚBLICA
  const openSefazConsulta = (nfeKey: string) => {
    // URL de consulta pública da SEFAZ (exemplo)
    const sefazUrl = `https://www.nfe.fazenda.gov.br/portal/consulta.aspx?tipoConsulta=completa&tipoConteudo=XbSeqxE8pl8=&chave=${nfeKey}`;
    window.open(sefazUrl, '_blank');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) await processFile(files[0]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) await processFile(files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importação de Notas Fiscais</h1>
        <p className="text-muted-foreground mt-1">
          Importe XML da NFe e baixe as notas fiscais diretamente da SEFAZ
        </p>
      </div>

      {/* Card de Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Nota Fiscal</CardTitle>
          <CardDescription>
            Faça upload do XML da NFe para importar produtos e obter acesso à nota na SEFAZ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-4">
              {isProcessing ? (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <p className="text-lg font-medium">
                  {isProcessing ? 'Processando nota fiscal...' : 'Arraste o XML da NFe aqui'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isProcessing ? 'Extraindo dados para acesso à SEFAZ' : 'Formato XML - Extraímos a chave de acesso'}
                </p>
              </div>
              <input
                type="file"
                id="file-input"
                accept=".xml"
                onChange={handleFileSelect}
                disabled={isProcessing}
                className="hidden"
              />
              <Button 
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Selecionar XML da NFe'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre SEFAZ */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 mb-3">🔗 Acesso à SEFAZ</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>Download Direto</strong>: Baixe a nota fiscal original da SEFAZ</li>
            <li>• <strong>Consulta Pública</strong>: Verifique a autenticidade da nota</li>
            <li>• <strong>DANFE</strong>: Obtenha a representação visual da nota</li>
            <li>• <strong>Sem Armazenamento</strong>: Não guardamos suas notas fiscais</li>
          </ul>
        </CardContent>
      </Card>

      {/* Histórico com Botões da SEFAZ */}
      {importHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Histórico de Importações</h2>
          <div className="space-y-3">
            {importHistory.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.fileName}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>Fornecedor: {item.supplier}</p>
                          <p>NFe: {item.nfeNumber} • {item.date.toLocaleDateString('pt-BR')}</p>
                          <p className="text-xs font-mono bg-muted p-1 rounded mt-1">
                            Chave: {item.nfeKey.substring(0, 20)}...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'processado' ? (
                        <>
                          <Badge className="bg-green-500 text-white">
                            <Package className="h-3 w-3 mr-1" />
                            {item.productsFound} produtos
                          </Badge>
                          
                          {/* 🔥 BOTÃO DOWNLOAD SEFAZ */}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => downloadFromSefaz(item.nfeKey, item.fileName)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Baixar NFe
                          </Button>

                          {/* 🔥 BOTÃO CONSULTA SEFAZ */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSefazConsulta(item.nfeKey)}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Consultar
                          </Button>
                        </>
                      ) : (
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Erro
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {importHistory.length === 0 && !isProcessing && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma nota fiscal importada</h3>
            <p className="text-muted-foreground">
              Faça o upload do XML para importar produtos e obter acesso à nota na SEFAZ
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}