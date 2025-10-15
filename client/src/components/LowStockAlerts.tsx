// components/LowStockAlerts.tsx - VERSÃO CORRIGIDA
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PackageX, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Alert {
  product: {
    id: string;
    code: string;
    name: string;
    quantity: number;
    minQuantity: number;
    unitPrice: string;
  };
  urgency: 'critical' | 'warning';
  message: string;
}

interface LowStockAlertsProps {
  alerts: Alert[];
  onViewAll: () => void;
}

export default function LowStockAlerts({ alerts, onViewAll }: LowStockAlertsProps) {
  const criticalAlerts = alerts.filter(alert => alert.urgency === 'critical');
  const warningAlerts = alerts.filter(alert => alert.urgency === 'warning');

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas de Estoque
            </CardTitle>
            <CardDescription>
              Produtos que precisam de atenção imediata
            </CardDescription>
          </div>
          <Badge variant={alerts.length > 0 ? "destructive" : "outline"}>
            {alerts.length} alertas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <PackageX className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta no momento</p>
            <p className="text-sm">Todos os produtos estão com estoque adequado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Alertas Críticos */}
            {criticalAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-600">
                    Crítico ({criticalAlerts.length})
                  </span>
                </div>
                {criticalAlerts.slice(0, 3).map((alert, index) => (
                  <div key={alert.product.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.product.name}</p>
                      <p className="text-xs text-red-600">{alert.message}</p>
                    </div>
                    <Badge variant="destructive" className="ml-2 flex-shrink-0">
                      {alert.product.quantity === 0 ? 'ESGOTADO' : 'CRÍTICO'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Alertas de Aviso */}
            {warningAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium text-amber-600">
                    Aviso ({warningAlerts.length})
                  </span>
                </div>
                {warningAlerts.slice(0, 2).map((alert, index) => (
                  <div key={alert.product.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.product.name}</p>
                      <p className="text-xs text-amber-600">{alert.message}</p>
                    </div>
                    <Badge variant="outline" className="ml-2 flex-shrink-0 bg-amber-100">
                      BAIXO
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {(criticalAlerts.length > 3 || warningAlerts.length > 2) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onViewAll}
                className="w-full mt-2"
              >
                Ver todos os alertas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}