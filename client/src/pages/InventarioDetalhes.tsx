// pages/InventarioDetalhes.tsx - VERSÃO SEGURA PARA PRODUÇÃO
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  Clock, 
  Package, 
  Search, 
  Filter, 
  Download, 
  Printer,
  BarChart3,
  AlertTriangle,
  CheckSquare,
  XCircle,
  RotateCcw,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Inventory, Product, InventoryCount } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InventarioDetalhesProps {
  id: string;
}

export default function InventarioDetalhes({ id }: InventarioDetalhesProps) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [countedItems, setCountedItems] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("contagem");

  if (!id || id === 'undefined' || id === '') {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-destructive">ID do inventário inválido</h2>
        <p className="text-muted-foreground mb-4">
          O inventário solicitado não pôde ser carregado.
        </p>
        <Button onClick={() => setLocation('/inventario')}>
          Voltar para Inventários
        </Button>
      </div>
    );
  }

  const { 
    data: inventory, 
    isLoading: inventoryLoading, 
    refetch: refetchInventory, 
    error: inventoryError 
  } = useQuery<Inventory>({
    queryKey: [`/api/inventories/${id}`],
    enabled: !!id && id !== 'undefined'
  });

  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError 
  } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { 
    data: inventoryCounts = [], 
    refetch: refetchCounts, 
    error: countsError 
  } = useQuery<InventoryCount[]>({
    queryKey: [`/api/inventories/${id}/counts`],
    enabled: !!id && id !== 'undefined'
  });

  const saveCountMutation = useMutation({
    mutationFn: async ({ productId, countedQuantity }: { productId: string; countedQuantity: number }) => {
      const product = products.find(p => p.id === productId);
      const expectedQuantity = product?.quantity || 0;
      
      const response = await apiRequest('POST', `/api/inventories/${id}/counts`, {
        productId,
        expectedQuantity,
        countedQuantity,
        difference: countedQuantity - expectedQuantity
      });
      return response.json();
    },
    onSuccess: () => {
      refetchCounts();
    },
    onError: (error) => {
      alert('Erro ao salvar contagem: ' + error.message);
    }
  });

  const finalizeInventoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', `/api/inventories/${id}/finalize`);
      return response.json();
    },
    onSuccess: () => {
      refetchInventory();
      alert('Inventário finalizado com sucesso!');
    },
    onError: (error) => {
      alert('Erro ao finalizar inventário: ' + error.message);
    }
  });

  const reopenInventoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', `/api/inventories/${id}/reopen`);
      return response.json();
    },
    onSuccess: () => {
      refetchInventory();
      alert('Inventário reaberto com sucesso!');
    },
    onError: (error) => {
      alert('Erro ao reabrir inventário: ' + error.message);
    }
  });

  const stats = {
    totalItems: products.length,
    countedItems: inventoryCounts.length,
    pendingItems: products.length - inventoryCounts.length,
    itemsWithDifference: inventoryCounts.filter(count => count.difference !== 0).length,
    itemsExact: inventoryCounts.filter(count => count.difference === 0).length,
    itemsOver: inventoryCounts.filter(count => count.difference > 0).length,
    itemsUnder: inventoryCounts.filter(count => count.difference < 0).length,
    totalDifference: inventoryCounts.reduce((sum, count) => sum + count.difference, 0),
    totalValueDifference: inventoryCounts.reduce((sum, count) => {
      const product = products.find(p => p.id === count.productId);
      const unitPrice = product ? parseFloat(product.unitPrice) : 0;
      return sum + (count.difference * unitPrice);
    }, 0),
    progress: products.length > 0 ? (inventoryCounts.length / products.length) * 100 : 0
  };

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product =>
      filterCategory === "all" || product.categoryId === filterCategory
    )
    .filter(product => {
      if (filterStatus === "all") return true;
      if (filterStatus === "counted") return inventoryCounts.some(c => c.productId === product.id);
      if (filterStatus === "pending") return !inventoryCounts.some(c => c.productId === product.id);
      if (filterStatus === "with_difference") {
        const count = inventoryCounts.find(c => c.productId === product.id);
        return count && count.difference !== 0;
      }
      return true;
    });

  const handleSaveCount = (productId: string) => {
    const countedQuantity = countedItems[productId];
    
    if (countedQuantity === undefined || countedQuantity < 0) {
      alert('Por favor, digite uma quantidade válida');
      return;
    }

    saveCountMutation.mutate({ productId, countedQuantity });
    setCountedItems(prev => ({ ...prev, [productId]: 0 }));
  };

  const handleSaveAllCounts = () => {
    const itemsToSave = Object.entries(countedItems).filter(([_, quantity]) => quantity > 0);
    
    if (itemsToSave.length === 0) {
      alert('Nenhuma contagem para salvar');
      return;
    }

    if (confirm(`Deseja salvar ${itemsToSave.length} contagens?`)) {
      itemsToSave.forEach(([productId, quantity]) => {
        saveCountMutation.mutate({ productId, countedQuantity: quantity });
      });
      setCountedItems({});
    }
  };

  const handleFinalizeInventory = () => {
    if (stats.countedItems < stats.totalItems) {
      if (!confirm(`Apenas ${stats.countedItems} de ${stats.totalItems} itens foram contados (${Math.round(stats.progress)}%). Deseja finalizar mesmo assim?`)) {
        return;
      }
    }

    if (stats.itemsWithDifference > 0) {
      if (!confirm(`${stats.itemsWithDifference} itens possuem diferenças. Deseja finalizar o inventário com essas divergências?`)) {
        return;
      }
    }

    if (confirm('Tem certeza que deseja finalizar este inventário? Após finalizar, não será possível alterar as contagens.')) {
      finalizeInventoryMutation.mutate();
    }
  };

  const handleReopenInventory = () => {
    if (confirm('Tem certeza que deseja reabrir este inventário? Isso permitirá editar as contagens novamente.')) {
      reopenInventoryMutation.mutate();
    }
  };

  const handleQuickCount = (productId: string, quantity: number) => {
    setCountedItems(prev => ({ ...prev, [productId]: quantity }));
  };

  if (inventoryLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando inventário...</p>
        </div>
      </div>
    );
  }

  if (inventoryError) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-destructive">Erro ao carregar inventário</h2>
        <p className="text-muted-foreground mb-4">Não foi possível carregar os dados do inventário</p>
        <Button onClick={() => setLocation('/inventario')}>
          Voltar para Inventários
        </Button>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Inventário não encontrado</h2>
        <p className="text-muted-foreground mb-4">O inventário solicitado não existe</p>
        <Button onClick={() => setLocation('/inventario')}>
          Voltar para Inventários
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation('/inventario')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{inventory.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {inventory.status === 'em_andamento' ? (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Em Andamento
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Finalizado
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Criado em {format(new Date(inventory.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                {inventory.finishedAt && (
                  <> • Finalizado em {format(new Date(inventory.finishedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {inventory.status === 'em_andamento' ? (
            <Button 
              onClick={handleFinalizeInventory}
              disabled={finalizeInventoryMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {finalizeInventoryMutation.isPending ? "Finalizando..." : "Finalizar Inventário"}
            </Button>
          ) : (
            <Button 
              onClick={handleReopenInventory}
              disabled={reopenInventoryMutation.isPending}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {reopenInventoryMutation.isPending ? "Reabrindo..." : "Reabrir Inventário"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.totalItems}</CardTitle>
            <CardDescription>Total Itens</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-green-600">{stats.countedItems}</CardTitle>
            <CardDescription>Contados</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-orange-600">{stats.pendingItems}</CardTitle>
            <CardDescription>Pendentes</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-red-600">{stats.itemsWithDifference}</CardTitle>
            <CardDescription>Com Diferença</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.itemsOver}</CardTitle>
            <CardDescription>Acima do Esperado</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.itemsUnder}</CardTitle>
            <CardDescription>Abaixo do Esperado</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progresso da contagem</span>
              <span>{stats.countedItems} de {stats.totalItems} itens ({Math.round(stats.progress)}%)</span>
            </div>
            <Progress value={stats.progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.itemsExact} exatos</span>
              <span>{stats.itemsOver} acima</span>
              <span>{stats.itemsUnder} abaixo</span>
              <span>{stats.pendingItems} pendentes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contagem">
            <CheckSquare className="h-4 w-4 mr-2" />
            Contagem
          </TabsTrigger>
          <TabsTrigger value="diferencas">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Diferenças
          </TabsTrigger>
          <TabsTrigger value="relatorio">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatório
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contagem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contagem de Itens</CardTitle>
              <CardDescription>
                {inventory.status === 'finalizado' 
                  ? 'Inventário finalizado - Visualização apenas' 
                  : 'Registre as quantidades contadas de cada item'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por produto ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      disabled={inventory.status === 'finalizado'}
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="counted">Contados</SelectItem>
                    <SelectItem value="with_difference">Com diferença</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inventory.status === 'em_andamento' && Object.keys(countedItems).filter(k => countedItems[k] > 0).length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-800">
                        {Object.keys(countedItems).filter(k => countedItems[k] > 0).length} contagens prontas para salvar
                      </h4>
                      <p className="text-sm text-blue-600">Salve todas as contagens de uma vez</p>
                    </div>
                    <Button onClick={handleSaveAllCounts} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Todas
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="text-right">Estoque Esperado</TableHead>
                      <TableHead className="text-right">Quantidade Contada</TableHead>
                      <TableHead className="text-right">Diferença</TableHead>
                      <TableHead>Status</TableHead>
                      {inventory.status === 'em_andamento' && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const count = inventoryCounts.find(c => c.productId === product.id);
                      const difference = count ? count.difference : 0;
                      const isCounted = !!count;
                      
                      return (
                        <TableRow key={product.id} className={!isCounted ? "bg-orange-50" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {product.name}
                              {!isCounted && <Clock className="h-3 w-3 text-orange-500" />}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.code}</TableCell>
                          <TableCell className="text-right font-mono">{product.quantity}</TableCell>
                          
                          {inventory.status === 'finalizado' ? (
                            <>
                              <TableCell className="text-right font-mono">
                                {count ? count.countedQuantity : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-mono ${difference > 0 ? 'text-green-600 font-bold' : difference < 0 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                  {difference > 0 ? '+' : ''}{difference}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={difference === 0 ? "default" : "destructive"}>
                                  {difference === 0 ? 'OK' : 'Divergência'}
                                </Badge>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={countedItems[product.id] || (count ? count.countedQuantity : '')}
                                    onChange={(e) => setCountedItems(prev => ({
                                      ...prev,
                                      [product.id]: parseInt(e.target.value) || 0
                                    }))}
                                    className="w-24"
                                    placeholder="0"
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuickCount(product.id, product.quantity)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuickCount(product.id, 0)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <EyeOff className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-mono ${difference > 0 ? 'text-green-600 font-bold' : difference < 0 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                  {difference > 0 ? '+' : ''}{difference}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={!isCounted ? "secondary" : difference === 0 ? "default" : "destructive"}>
                                  {!isCounted ? 'Pendente' : difference === 0 ? 'OK' : 'Divergência'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveCount(product.id)}
                                  disabled={saveCountMutation.isPending || !countedItems[product.id]}
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Salvar
                                </Button>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diferencas">
          <Card>
            <CardHeader>
              <CardTitle>Itens com Diferenças</CardTitle>
              <CardDescription>
                {stats.itemsWithDifference} itens com divergências encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryCounts
                  .filter(count => count.difference !== 0)
                  .map(count => {
                    const product = products.find(p => p.id === count.productId);
                    if (!product) return null;
                    
                    return (
                      <div key={count.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">Código: {product.code}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Esperado</p>
                              <p className="font-mono">{count.expectedQuantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Contado</p>
                              <p className="font-mono">{count.countedQuantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Diferença</p>
                              <p className={`font-mono font-bold ${count.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {count.difference > 0 ? '+' : ''}{count.difference}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                {stats.itemsWithDifference === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma diferença encontrada</h3>
                    <p className="text-muted-foreground">Todos os itens contados estão corretos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorio">
          <Card>
            <CardHeader>
              <CardTitle>Relatório do Inventário</CardTitle>
              <CardDescription>
                Resumo completo do inventário {inventory.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estatísticas Gerais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total de itens:</span>
                        <span className="font-semibold">{stats.totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Itens contados:</span>
                        <span className="font-semibold text-green-600">{stats.countedItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Itens pendentes:</span>
                        <span className="font-semibold text-orange-600">{stats.pendingItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progresso:</span>
                        <span className="font-semibold">{Math.round(stats.progress)}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Divergências</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Itens com diferença:</span>
                        <span className="font-semibold text-red-600">{stats.itemsWithDifference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Itens acima do esperado:</span>
                        <span className="font-semibold text-green-600">{stats.itemsOver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Itens abaixo do esperado:</span>
                        <span className="font-semibold text-red-600">{stats.itemsUnder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diferença total:</span>
                        <span className={`font-semibold ${stats.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.totalDifference > 0 ? '+' : ''}{stats.totalDifference}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Linha do Tempo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold">Inventário Criado</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(inventory.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      {inventory.finishedAt && (
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold">Inventário Finalizado</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(inventory.finishedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}