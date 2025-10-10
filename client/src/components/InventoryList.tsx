import { Calendar, User, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Inventory {
  id: string;
  name: string;
  status: 'em_andamento' | 'finalizado';
  user: string;
  createdAt: Date;
  finishedAt?: Date;
  itemsCount: number;
}

interface InventoryListProps {
  inventories: Inventory[];
  onView?: (inventory: Inventory) => void;
  onFinalize?: (inventory: Inventory) => void;
}

export default function InventoryList({ inventories, onView, onFinalize }: InventoryListProps) {
  const getStatusBadge = (status: string) => {
    if (status === 'finalizado') {
      return (
        <Badge className="bg-chart-2 text-white border-chart-2" data-testid="badge-finalizado">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Finalizado
        </Badge>
      );
    }
    return (
      <Badge className="bg-chart-3 text-white border-chart-3" data-testid="badge-em-andamento">
        <Clock className="h-3 w-3 mr-1" />
        Em Andamento
      </Badge>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {inventories.map((inventory) => (
        <Card key={inventory.id} data-testid={`card-inventory-${inventory.id}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base" data-testid={`text-name-${inventory.id}`}>
                {inventory.name}
              </CardTitle>
              {getStatusBadge(inventory.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span data-testid={`text-user-${inventory.id}`}>{inventory.user}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(inventory.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium" data-testid={`text-items-${inventory.id}`}>
                {inventory.itemsCount} itens
              </span>
              <span className="text-muted-foreground"> contados</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onView?.(inventory)}
                data-testid={`button-view-${inventory.id}`}
              >
                Visualizar
              </Button>
              {inventory.status === 'em_andamento' && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onFinalize?.(inventory)}
                  data-testid={`button-finalize-${inventory.id}`}
                >
                  Finalizar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
