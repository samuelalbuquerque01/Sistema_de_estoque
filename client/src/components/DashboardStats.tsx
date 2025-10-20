import { Package, AlertTriangle, TrendingUp, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
}

function StatCard({ title, value, icon, trend, description }: StatCardProps) {
  return (
    <Card data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-chart-2' : 'text-destructive'} mt-1`}>
            {trend.value}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalProducts: number;
  lowStock: number;
  totalValue: number;
  movements: number;
  outOfStock?: number;
  movementStats?: {
    entrada: number;
    saida: number;
  };
}

export default function DashboardStats({ 
  totalProducts, 
  lowStock, 
  totalValue, 
  movements, 
  outOfStock,
  movementStats 
}: DashboardStatsProps) {
  
  const formatCurrency = (value: number) => {
    const numericValue = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  };

  const getMovementTrend = () => {
    if (!movementStats) return undefined;
    
    const totalMovements = (movementStats.entrada || 0) + (movementStats.saida || 0);
    
    const balance = (movementStats.entrada || 0) - (movementStats.saida || 0);
    const isPositive = balance >= 0;
    
    return {
      value: isPositive ? `+${balance} saldo` : `${balance} saldo`,
      isPositive
    };
  };

  const getLowStockDescription = () => {
    if (outOfStock && outOfStock > 0) {
      return `${outOfStock} sem estoque`;
    }
    return "Requer atenção";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Produtos"
        value={totalProducts || 0}
        icon={<Package className="h-4 w-4" />}
        description="Itens cadastrados"
      />
      
      <StatCard
        title="Estoque Baixo"
        value={lowStock || 0}
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={{ 
          value: getLowStockDescription(), 
          isPositive: false 
        }}
      />
      
      <StatCard
        title="Valor Total"
        value={formatCurrency(totalValue)}
        icon={<Archive className="h-4 w-4" />}
        description="Valor em estoque"
      />
      
      <StatCard
        title="Movimentações"
        value={movements || 0}
        icon={<TrendingUp className="h-4 w-4" />}
        trend={getMovementTrend()}
        description={movementStats ? `${movementStats.entrada || 0} entradas` : "Total do período"}
      />
    </div>
  );
}