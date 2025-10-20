// Movimentacoes.tsx - Versão Unificada
import { useState, useEffect, useCallback } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MovementForm from "@/components/MovementForm";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
}

interface Movement {
  id: string;
  productId: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  notes?: string;
  createdAt: string;
  productName?: string;
  productCode?: string;
}

interface MovementData {
  productId: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  notes?: string;
}

export default function Movimentacoes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { 
    data: movements = [], 
    isLoading: movementsLoading, 
    error: movementsError,
    refetch: refetchMovements 
  } = useQuery<Movement[]>({
    queryKey: ['/api/movements'],
  });

  const calculateNewQuantity = (product: Product, data: MovementData): number => {
    switch (data.type) {
      case 'entrada':
        return product.quantity + data.quantity;
      case 'saida':
        return product.quantity - data.quantity;
      case 'ajuste':
        return data.quantity;
      default:
        return product.quantity;
    }
  };

  const handleMovementSubmit = async (data: MovementData) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const product = products.find(p => p.id === data.productId);
      if (!product) {
        toast.error('Produto não encontrado');
        return;
      }

      if (data.type === 'saida' && product.quantity < data.quantity) {
        toast.error('Quantidade insuficiente em estoque');
        return;
      }

      if (data.quantity <= 0) {
        toast.error('Quantidade deve ser maior que zero');
        return;
      }

      const movementResponse = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          productName: product.name,
          productCode: product.code,
          timestamp: new Date().toISOString()
        })
      });

      if (!movementResponse.ok) throw new Error('Erro ao registrar movimentação');

      const newQuantity = calculateNewQuantity(product, data);
      
      const updateResponse = await fetch(`/api/products/${data.productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!updateResponse.ok) throw new Error('Erro ao atualizar estoque');

      toast.success('Movimentação registrada com sucesso!');
      
      await Promise.all([refetchProducts(), refetchMovements()]);
      setIsDialogOpen(false);
      
    } catch (error) {
      toast.error('Erro ao registrar movimentação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProductInfo = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return {
      name: product?.name || 'Produto não encontrado',
      code: product?.code || 'N/A'
    };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <ArrowDownCircle className="h-4 w-4 text-chart-2" />;
      case 'saida':
        return <ArrowUpCircle className="h-4 w-4 text-destructive" />;
      case 'ajuste':
        return <RefreshCw className="h-4 w-4 text-chart-3" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'entrada':
        return <Badge className="bg-chart-2 text-white border-chart-2">Entrada</Badge>;
      case 'saida':
        return <Badge variant="destructive">Saída</Badge>;
      case 'ajuste':
        return <Badge className="bg-chart-3 text-white border-chart-3">Ajuste</Badge>;
      default:
        return null;
    }
  };

  const filteredMovements = movements
    .filter(mov => filterType === "all" || mov.type === filterType)
    .filter(mov => {
      const productInfo = getProductInfo(mov.productId);
      return (
        productInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productInfo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const InfoCard = ({ 
    title, 
    description, 
    variant 
  }: { 
    title: string;
    description: string;
    variant: 'entrada' | 'saida' | 'ajuste';
  }) => {
    const variants = {
      entrada: {
        bg: "bg-chart-2/10",
        border: "border-chart-2/20",
        text: "text-chart-2"
      },
      saida: {
        bg: "bg-destructive/10",
        border: "border-destructive/20",
        text: "text-destructive"
      },
      ajuste: {
        bg: "bg-chart-3/10",
        border: "border-chart-3/20",
        text: "text-chart-3"
      }
    };

    const currentVariant = variants[variant];

    return (
      <div className={`p-6 rounded-lg border ${currentVariant.bg} ${currentVariant.border}`}>
        <h3 className={`font-semibold mb-2 ${currentVariant.text}`}>{title}</h3>
        <p className="text-2xl font-bold">
          {variant === 'entrada' ? '+ Estoque' : variant === 'saida' ? '- Estoque' : '± Estoque'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>
    );
  };

  const isLoading = productsLoading || movementsLoading;
  const hasError = productsError || movementsError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Movimentações</h1>
            <p className="text-muted-foreground mt-1">Registrar e visualizar movimentações de estoque</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Movimentações</h1>
          <p className="text-muted-foreground mt-1">
            {hasError ? 'Erro ao carregar dados - Tentando recuperar...' : 'Registrar e visualizar movimentações de estoque'}
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          disabled={submitting || hasError}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <InfoCard
          title="Entradas"
          description="Adicionar produtos ao estoque (compras, doações, etc.)"
          variant="entrada"
        />
        <InfoCard
          title="Saídas"
          description="Remover produtos do estoque (vendas, consumo, etc.)"
          variant="saida"
        />
        <InfoCard
          title="Ajustes"
          description="Corrigir divergências de inventário"
          variant="ajuste"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar 
            placeholder="Buscar por produto, código ou observação..." 
            onSearch={setSearchTerm}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="entrada">Entradas</SelectItem>
            <SelectItem value="saida">Saídas</SelectItem>
            <SelectItem value="ajuste">Ajustes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {movements.length === 0 ? 
                    "Nenhuma movimentação registrada ainda" : 
                    "Nenhuma movimentação encontrada com os filtros aplicados"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((movement) => {
                const productInfo = getProductInfo(movement.productId);
                return (
                  <TableRow key={movement.id}>
                    <TableCell>{getIcon(movement.type)}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(movement.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getTypeBadge(movement.type)}</TableCell>
                    <TableCell className="font-medium">
                      {productInfo.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {productInfo.code}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {movement.type === 'saida' ? '-' : '+'}{movement.quantity}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {movement.notes || '-'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma entrada, saída ou ajuste de estoque
            </DialogDescription>
          </DialogHeader>
          <MovementForm
            products={products}
            onSubmit={handleMovementSubmit}
            onCancel={() => setIsDialogOpen(false)}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}