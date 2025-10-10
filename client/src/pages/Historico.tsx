import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import SearchBar from "@/components/SearchBar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Historico() {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  //todo: remove mock functionality
  const mockMovements = [
    { id: '1', type: 'entrada', productName: 'Monitor Dell 24"', productCode: 'PROD-001', quantity: 10, user: 'João Silva', createdAt: new Date(2025, 0, 10, 14, 30), notes: 'Compra fornecedor XYZ' },
    { id: '2', type: 'saida', productName: 'Teclado Mecânico', productCode: 'PROD-002', quantity: 5, user: 'Maria Santos', createdAt: new Date(2025, 0, 10, 10, 15), notes: 'Distribuição setor TI' },
    { id: '3', type: 'ajuste', productName: 'Papel A4 Sulfite', productCode: 'INSU-001', quantity: 3, user: 'Pedro Costa', createdAt: new Date(2025, 0, 9, 16, 45), notes: 'Correção de inventário' },
    { id: '4', type: 'entrada', productName: 'Alicate Universal', productCode: 'FERR-001', quantity: 15, user: 'Ana Paula', createdAt: new Date(2025, 0, 9, 9, 0), notes: '' },
    { id: '5', type: 'saida', productName: 'Detergente Industrial', productCode: 'LIMP-001', quantity: 8, user: 'Carlos Lima', createdAt: new Date(2025, 0, 8, 13, 20), notes: 'Limpeza prédio A' },
    { id: '6', type: 'entrada', productName: 'Mouse Óptico', productCode: 'PROD-003', quantity: 20, user: 'João Silva', createdAt: new Date(2025, 0, 8, 8, 30), notes: 'Pedido 2025-001' },
  ];

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

  const filteredMovements = mockMovements
    .filter(mov => filterType === "all" || mov.type === filterType)
    .filter(mov => 
      mov.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.productCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Movimentações</h1>
        <p className="text-muted-foreground mt-1">Visualizar todas as movimentações de estoque</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar 
            placeholder="Buscar por produto ou código..." 
            onSearch={setSearchTerm}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-type">
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
              <TableHead>Usuário</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((movement) => (
              <TableRow key={movement.id} data-testid={`row-movement-${movement.id}`}>
                <TableCell>{getIcon(movement.type)}</TableCell>
                <TableCell className="text-sm">
                  {format(movement.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>{getTypeBadge(movement.type)}</TableCell>
                <TableCell className="font-medium" data-testid={`text-product-${movement.id}`}>
                  {movement.productName}
                </TableCell>
                <TableCell className="font-mono text-sm" data-testid={`text-code-${movement.id}`}>
                  {movement.productCode}
                </TableCell>
                <TableCell className="text-right font-mono font-medium" data-testid={`text-quantity-${movement.id}`}>
                  {movement.type === 'saida' ? '-' : '+'}{movement.quantity}
                </TableCell>
                <TableCell data-testid={`text-user-${movement.id}`}>{movement.user}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {movement.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
