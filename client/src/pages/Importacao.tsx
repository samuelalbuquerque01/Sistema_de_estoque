// Importacao.tsx - Versão Corrigida e Melhorada
import { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  Download, 
  Package, 
  ExternalLink,
  AlertTriangle,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ImportHistory {
  id: string;
  fileName: string;
  status: 'processado' | 'erro' | 'processando';
  productsFound: number;
  supplier: string;
  nfeNumber: string;
  nfeKey: string;
  date: Date;
  errorMessage?: string;
}

interface ProcessResult {
  productsProcessed: number;
  nfeData: {
    supplier: string;
    documentNumber: string;
    accessKey: string;
    emissionDate?: string;
    totalValue?: number;
  };
}

export default function Importacao() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateXmlFile = (file: File): boolean => {
    // Validações mais robustas
    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast.error('Apenas arquivos XML são suportados');
      return false;
    }

    if (file.size === 0) {
      toast.error('O arquivo está vazio');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limite
      toast.error('Arquivo muito grande. Máximo 10MB permitido.');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateXmlFile(file)) return;

    setIsProcessing(true);
    setUploadProgress(0);

    const importId = Date.now().toString();
    
    // Adicionar item de histórico como "processando"
    const processingImport: ImportHistory = {
      id: importId,
      fileName: file.name,
      status: 'processando',
      productsFound: 0,
      supplier: 'Processando...',
      nfeNumber: '...',
      nfeKey: '',
      date: new Date(),
    };

    setImportHistory(prev => [processingImport, ...prev]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/import/xml', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const result: ProcessResult = await response.json();
      
      // Atualizar histórico com sucesso
      const successImport: ImportHistory = {
        ...processingImport,
        status: 'processado',
        productsFound: result.productsProcessed,
        supplier: result.nfeData.supplier,
        nfeNumber: result.nfeData.documentNumber,
        nfeKey: result.nfeData.accessKey,
      };

      setImportHistory(prev => 
        prev.map(item => item.id === importId ? successImport : item)
      );

      toast.success(`${result.productsProcessed} produtos importados da nota fiscal ${result.nfeData.documentNumber}`);

    } catch (error) {
      // Atualizar histórico com erro
      const failedImport: ImportHistory = {
        ...processingImport,
        status: 'erro',
        productsFound: 0,
        supplier: 'N/A',
        nfeNumber: 'N/A',
        nfeKey: '',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      };

      setImportHistory(prev => 
        prev.map(item => item.id === importId ? failedImport : item)
      );

      toast.error(`Erro na importação: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      
      // Limpar input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadFromSefaz = async (nfeKey: string, fileName: string) => {
    try {
      toast.info('Iniciando download da SEFAZ...');
      
      const response = await fetch('/api/invoices/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nfeKey }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Erro ao baixar da SEFAZ');
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Arquivo vazio recebido da SEFAZ');
      }

      const contentType = response.headers.get('content-type');
      const extension = contentType?.includes('pdf') ? 'pdf' : 
                       contentType?.includes('xml') ? 'xml' : 'bin';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nota_fiscal_${nfeKey}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Nota fiscal baixada com sucesso!');
    } catch (error) {
      console.error('Erro no download:', error);
      toast.error(`Erro ao baixar: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    }
  };

  const openSefazConsulta = (nfeKey: string) => {
    // URL oficial de consulta da SEFAZ
    const sefazUrl = `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConteudo=XbSeqxE8pl8=&chave=${nfeKey}`;
    window.open(sefazUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (files.length > 1) {
        toast.warning('Apenas um arquivo por vez é permitido');
        return;
      }
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Só sai do estado de drag se o mouse sair da área do dropzone
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const clearHistory = () => {
    if (confirm('Deseja limpar todo o histórico de importações?')) {
      setImportHistory([]);
      toast.info('Histórico limpo');
    }
  };

  const getStatusBadge = (status: ImportHistory['status'], errorMessage?: string) => {
    switch (status) {
      case 'processando':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <div className="animate-spin h-3 w-3 mr-1 border-2 border-blue-800 border-t-transparent rounded-full" />
          Processando
        </Badge>;
      case 'processado':
        return <Badge className="bg-green-500 text-white">
          <Check className="h-3 w-3 mr-1" />
          Processado
        </Badge>;
      case 'erro':
        return <Badge variant="destructive" title={errorMessage}>
          <X className="h-3 w-3 mr-1" />
          Erro
        </Badge>;
      default:
        return null;
    }
  };

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
            Faça upload do XML da NFe para importar produtos automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging 
                ? 'border-primary bg-primary/10 scale-[1.02]' 
                : 'border-border hover:border-primary/50'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-4">
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                  {uploadProgress > 0 && (
                    <div className="w-full max-w-xs space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {uploadProgress < 100 ? 'Processando...' : 'Finalizando...'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {isDragging ? 'Solte o arquivo aqui' : 'Clique ou arraste o XML da NFe'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Suporte para arquivos XML de nota fiscal eletrônica
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,application/xml,text/xml"
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="hidden"
          />

          {/* Dicas de uso */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Dicas para importação:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use arquivos XML de NFe válidos</li>
                  <li>• Verifique se a chave de acesso está correta</li>
                  <li>• Certifique-se de estar conectado à internet para acesso à SEFAZ</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico com Botões da SEFAZ */}
      {importHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Histórico de Importações</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearHistory}
              disabled={isProcessing}
            >
              Limpar Histórico
            </Button>
          </div>
          
          <div className="space-y-3">
            {importHistory.map((item) => (
              <Card key={item.id} className={item.status === 'erro' ? 'border-destructive/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {item.status === 'erro' ? (
                          <AlertTriangle className="h-8 w-8 text-destructive" />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{item.fileName}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>Fornecedor: {item.supplier}</p>
                          <p>NFe: {item.nfeNumber} • {item.date.toLocaleDateString('pt-BR')}</p>
                          {item.nfeKey && (
                            <p className="text-xs font-mono bg-muted p-1 rounded mt-1 truncate">
                              Chave: {item.nfeKey}
                            </p>
                          )}
                          {item.errorMessage && (
                            <p className="text-xs text-destructive mt-1">
                              Erro: {item.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(item.status, item.errorMessage)}
                      
                      {item.status === 'processado' && (
                        <>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Package className="h-3 w-3 mr-1" />
                            {item.productsFound} produtos
                          </Badge>
                          
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => downloadFromSefaz(item.nfeKey, item.fileName)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Baixar
                          </Button>

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
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma nota fiscal importada</h3>
            <p className="text-muted-foreground mb-6">
              Faça o upload do XML para importar produtos e obter acesso à nota na SEFAZ
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Primeiro XML
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}