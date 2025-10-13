// components/InventoryList.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Eye, FileText } from "lucide-react";
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
  onView: (inventory: Inventory) => void;
  onFinalize: (inventory: Inventory) => void;
  isLoading?: boolean;
}

export default function InventoryList({ inventories, onView, onFinalize, isLoading }: InventoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (inventories.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum inventário encontrado</h3>
        <p className="text-muted-foreground">Comece criando seu primeiro inventário</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inventories.map((inventory) => (
        <Card key={inventory.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{inventory.name}</CardTitle>
                <CardDescription>
                  Criado por {inventory.user} em {format(inventory.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  {inventory.finishedAt && (
                    <> • Finalizado em {format(inventory.finishedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {inventory.itemsCount} itens para contar
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔍 InventoryList - Clicou em Visualizar:');
                    console.log('   Inventário ID:', inventory.id);
                    console.log('   Tipo do ID:', typeof inventory.id);
                    console.log('   Inventário objeto:', inventory);
                    window.location.href = `/inventario/${inventory.id}`;
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </Button>
                {inventory.status === 'em_andamento' && (
                  <Button
                    size="sm"
                    onClick={() => onFinalize(inventory)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finalizar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}