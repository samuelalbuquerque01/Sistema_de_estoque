import { useState } from "react";
import { Upload, FileText, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Importacao() {
  const [isDragging, setIsDragging] = useState(false);

  //todo: remove mock functionality
  const mockImportHistory = [
    { id: '1', fileName: 'nota_fiscal_2025_001.pdf', status: 'processado', productsFound: 12, date: new Date(2025, 0, 10) },
    { id: '2', fileName: 'pedido_compra_2025_002.pdf', status: 'processado', productsFound: 8, date: new Date(2025, 0, 9) },
    { id: '3', fileName: 'relatorio_mensal.pdf', status: 'erro', productsFound: 0, date: new Date(2025, 0, 8) },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    console.log('Arquivo enviado:', e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importação de Documentos</h1>
        <p className="text-muted-foreground mt-1">Importar produtos de notas fiscais e documentos PDF</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Documento</CardTitle>
          <CardDescription>Arraste e solte um arquivo PDF ou clique para selecionar</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            data-testid="dropzone-upload"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Arraste seu arquivo aqui</p>
                <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar (PDF, máx. 10MB)</p>
              </div>
              <Button data-testid="button-select-file">
                Selecionar Arquivo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Histórico de Importações</h2>
        <div className="space-y-3">
          {mockImportHistory.map((item) => (
            <Card key={item.id} data-testid={`import-history-${item.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium" data-testid={`text-filename-${item.id}`}>{item.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.date.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.status === 'processado' ? (
                      <>
                        <Badge className="bg-chart-2 text-white border-chart-2">
                          <Check className="h-3 w-3 mr-1" />
                          Processado
                        </Badge>
                        <span className="text-sm text-muted-foreground" data-testid={`text-products-${item.id}`}>
                          {item.productsFound} produtos
                        </span>
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
    </div>
  );
}
