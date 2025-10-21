// src/pages/HistoricoImportacoes.tsx - VERSÃO CORRIGIDA
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Download, 
  Eye, 
  RefreshCw, 
  Trash2,
  Filter,
  Search,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ImportHistoryItem {
  id: string;
  fileName: string;
  status: 'processado' | 'erro' | 'processando' | 'parcial';
  productsFound: number;
  productsCreated: number;
  productsUpdated: number;
  supplier: string;
  supplierCnpj: string;
  supplierAddress?: string;
  nfeNumber: string;
  nfeKey: string;
  emissionDate: string;
  totalValue: string;
  userId: string | null;
  processedAt?: string;
  errorMessage?: string | null;
  createdAt: string;
}

interface NfeProduct {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  totalValue: number;
}

export default function HistoricoImportacoes() {
  const [selectedImport, setSelectedImport] = useState<ImportHistoryItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const queryClient = useQueryClient();

  // Buscar histórico da API
  const { data: importsData = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/import/history'],
  });

  // Mapear dados da API para a interface do frontend
  const imports: ImportHistoryItem[] = Array.isArray(importsData) ? importsData.map(item => ({
    id: item.id || '',
    fileName: item.fileName || '',
    status: item.status || 'erro',
    productsFound: item.productsFound || 0,
    productsCreated: item.productsCreated || 0,
    productsUpdated: item.productsUpdated || 0,
    supplier: item.supplier || 'Fornecedor não identificado',
    supplierCnpj: item.supplierCnpj || '',
    supplierAddress: item.supplierAddress,
    nfeNumber: item.nfeNumber || '',
    nfeKey: item.nfeKey || '',
    emissionDate: item.emissionDate || new Date().toISOString(),
    totalValue: item.totalValue || '0',
    userId: item.userId || null,
    processedAt: item.processedAt,
    errorMessage: item.errorMessage,
    createdAt: item.createdAt || new Date().toISOString()
  })) : [];

  // Buscar produtos da importação selecionada
  const { data: importProducts = [] } = useQuery<NfeProduct[]>({
    queryKey: [`/api/import/${selectedImport?.id}/nfe-products`],
    enabled: !!selectedImport,
  });

  // Mutation para excluir importação
  const deleteMutation = useMutation({
    mutationFn: async (importId: string) => {
      const response = await fetch(`/api/import/${importId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/import/history'] });
      toast.success('Importação excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  // Mutation para download do XML
  const downloadMutation = useMutation({
    mutationFn: async (importItem: ImportHistoryItem) => {
      const response = await fetch(`/api/import/${importItem.id}/download-xml`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      return blob;
    },
    onSuccess: (blob, importItem) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfe_${importItem.nfeKey}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('XML baixado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao baixar XML: ${error.message}`);
    },
  });

  // Estatísticas com tratamento seguro
  const stats = {
    total: imports.length,
    processed: imports.filter(i => i.status === 'processado').length,
    errors: imports.filter(i => i.status === 'erro').length,
    processing: imports.filter(i => i.status === 'processando').length,
    totalProducts: imports.reduce((sum, i) => sum + (i.productsFound || 0), 0),
    totalValue: imports.reduce((sum, i) => sum + (parseFloat(i.totalValue) || 0), 0),
  };

  // Importações filtradas
  const filteredImports = imports.filter(imp => {
    if (filterStatus !== 'all' && imp.status !== filterStatus) {
      return false;
    }

    if (searchTerm && 
        !imp.fileName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !imp.supplier.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !imp.nfeNumber.includes(searchTerm)) {
      return false;
    }

    if (dateRange.start && new Date(imp.createdAt) < new Date(dateRange.start)) {
      return false;
    }
    if (dateRange.end && new Date(imp.createdAt) > new Date(dateRange.end)) {
      return false;
    }

    return true;
  });

  const handleViewDetails = (importItem: ImportHistoryItem) => {
    setSelectedImport(importItem);
    setIsDetailsOpen(true);
  };

  const handleDownloadXml = async (importItem: ImportHistoryItem) => {
    downloadMutation.mutate(importItem);
  };

  const handleReprocess = async (importItem: ImportHistoryItem) => {
    try {
      const response = await fetch(`/api/import/${importItem.id}/reprocess`, {
        method: 'POST',
      });
      if (response.ok) {
        refetch();
        toast.success('Reprocessamento iniciado');
      } else {
        toast.error('Erro ao reprocessar');
      }
    } catch (error) {
      toast.error('Erro ao reprocessar');
    }
  };

  const handleDelete = async (importItem: ImportHistoryItem) => {
    if (confirm(`Tem certeza que deseja excluir permanentemente a importação "${importItem.fileName}"?\n\nEsta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(importItem.id);
    }
  };

  const getStatusBadge = (status: ImportHistoryItem['status']) => {
    switch (status) {
      case 'processado':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Processado</Badge>;
      case 'erro':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      case 'processando':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Processando</Badge>;
      case 'parcial':
        return <Badge className="bg-yellow-500 text-white"><AlertTriangle className="h-3 w-3 mr-1" />Parcial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Importações</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Histórico de Importações</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as importações de notas fiscais
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Erros</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processando</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por arquivo, fornecedor ou NFe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="processado">Processadas</SelectItem>
                <SelectItem value="erro">Com erro</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="parcial">Parciais</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Data início"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full sm:w-[140px]"
              />
              <Input
                type="date"
                placeholder="Data fim"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full sm:w-[140px]"
              />
            </div>

            <Button variant="outline" onClick={clearFilters}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Importações */}
      <Card>
        <CardHeader>
          <CardTitle>Importações Realizadas</CardTitle>
          <CardDescription>
            {filteredImports.length} importações encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>NFe</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredImports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma importação encontrada</h3>
                    <p className="text-muted-foreground">
                      {imports.length === 0 
                        ? "Ainda não há importações no histórico" 
                        : "Tente ajustar os filtros de busca"
                      }
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredImports.map((importItem) => (
                  <TableRow key={importItem.id}>
                    <TableCell className="text-sm">
                      {formatDate(importItem.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{importItem.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{importItem.supplier}</p>
                        <p className="text-sm text-muted-foreground">{importItem.supplierCnpj}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{importItem.nfeNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="w-fit">
                          {importItem.productsFound} encontrados
                        </Badge>
                        {importItem.productsCreated > 0 && (
                          <Badge className="bg-green-100 text-green-800 w-fit text-xs">
                            +{importItem.productsCreated} novos
                          </Badge>
                        )}
                        {importItem.productsUpdated > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 w-fit text-xs">
                            {importItem.productsUpdated} atualizados
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(importItem.status)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCurrency(parseFloat(importItem.totalValue) || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(importItem)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadXml(importItem)}
                          title="Baixar XML"
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {importItem.status === 'erro' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReprocess(importItem)}
                            title="Reprocessar"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(importItem)}
                          title="Excluir"
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Importação</DialogTitle>
          </DialogHeader>
          
          {selectedImport && (
            <div className="space-y-6">
              {/* Informações da NFe */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Nota Fiscal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Arquivo</label>
                      <p className="text-sm">{selectedImport.fileName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Número da NFe</label>
                      <p className="text-sm font-mono">{selectedImport.nfeNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Chave de Acesso</label>
                      <p className="text-sm font-mono break-all">{selectedImport.nfeKey}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data de Emissão</label>
                      <p className="text-sm">
                        {formatDate(selectedImport.emissionDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Valor Total</label>
                      <p className="text-sm font-mono font-semibold">
                        {formatCurrency(parseFloat(selectedImport.totalValue) || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div>{getStatusBadge(selectedImport.status)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações do Fornecedor */}
              <Card>
                <CardHeader>
                  <CardTitle>Fornecedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium">Nome/Razão Social</label>
                      <p className="text-sm">{selectedImport.supplier}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">CNPJ</label>
                      <p className="text-sm font-mono">{selectedImport.supplierCnpj}</p>
                    </div>
                    {selectedImport.supplierAddress && (
                      <div>
                        <label className="text-sm font-medium">Endereço</label>
                        <p className="text-sm">{selectedImport.supplierAddress}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Produtos da NFe */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Importados ({importProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead>Unidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono text-sm">{product.code}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right font-mono">{product.quantity}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(product.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(product.totalValue)}
                          </TableCell>
                          <TableCell>{product.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {importProducts.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum produto encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações de Processamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Processamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Data de Importação</label>
                      <p className="text-sm">
                        {formatDate(selectedImport.createdAt)}
                      </p>
                    </div>
                    {selectedImport.processedAt && (
                      <div>
                        <label className="text-sm font-medium">Data de Processamento</label>
                        <p className="text-sm">
                          {formatDate(selectedImport.processedAt)}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Produtos Encontrados</label>
                      <p className="text-sm">{selectedImport.productsFound}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Produtos Criados</label>
                      <p className="text-sm text-green-600">{selectedImport.productsCreated}</p>
                    </div>
                  </div>

                  {selectedImport.errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <label className="text-sm font-medium text-red-800">Erro no Processamento</label>
                      <p className="text-sm text-red-700 mt-1">{selectedImport.errorMessage}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações na modal de detalhes */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadXml(selectedImport)}
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar XML
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(selectedImport)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Importação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}