// components/RecentMovements.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Movement {
  id: string;
  productId: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  userId: string;
  notes?: string;
  createdAt: string;
  productName: string;
  user: string;
}

interface RecentMovementsProps {
  movements: Movement[];
  onViewAll: () => void;
}

export default function RecentMovements({ movements, onViewAll }: RecentMovementsProps) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'saida':
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-amber-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'entrada':
        return (
          <Badge className="bg-green-500 text-white border-green-500 hover:bg-green-600">
            ENTRADA
          </Badge>
        );
      case 'saida':
        return (
          <Badge variant="destructive" className="bg-red-500 text-white border-red-500 hover:bg-red-600">
            SAÍDA
          </Badge>
        );
      case 'ajuste':
        return (
          <Badge className="bg-amber-500 text-white border-amber-500 hover:bg-amber-600">
            AJUSTE
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {type.toUpperCase()}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Movimentações Recentes
            </CardTitle>
            <CardDescription>
              Últimas movimentações no estoque
            </CardDescription>
          </div>
          <Badge variant="outline">
            {movements.length} itens
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Nenhuma movimentação recente</p>
            <p className="text-sm">As movimentações aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {movements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getMovementIcon(movement.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{movement.productName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {movement.notes || 'Sem observações'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  {getMovementBadge(movement.type)}
                  <span className={`text-sm font-medium ${
                    movement.type === 'entrada' ? 'text-green-600' : 
                    movement.type === 'saida' ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {movement.type === 'entrada' ? '+' : movement.type === 'saida' ? '-' : '±'}{movement.quantity}
                  </span>
                </div>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewAll}
              className="w-full mt-2 hover:bg-primary/10"
            >
              Ver todas as movimentações
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}