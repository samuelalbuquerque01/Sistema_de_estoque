import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Movement {
  id: string;
  type: 'entrada' | 'saida' | 'ajuste';
  productName: string;
  quantity: number;
  user: string;
  createdAt: Date;
}

interface RecentMovementsProps {
  movements: Movement[];
}

export default function RecentMovements({ movements }: RecentMovementsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.map((movement) => (
            <div key={movement.id} className="flex items-center gap-4" data-testid={`movement-${movement.id}`}>
              <div>{getIcon(movement.type)}</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium" data-testid={`text-product-${movement.id}`}>{movement.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {movement.user} • {formatDistanceToNow(movement.createdAt, { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getTypeBadge(movement.type)}
                <span className="font-mono text-sm font-medium" data-testid={`text-quantity-${movement.id}`}>
                  {movement.type === 'saida' ? '-' : '+'}{movement.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
