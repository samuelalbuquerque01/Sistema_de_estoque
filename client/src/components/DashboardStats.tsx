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
}

export default function DashboardStats({ totalProducts, lowStock, totalValue, movements }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Produtos"
        value={totalProducts}
        icon={<Package className="h-4 w-4" />}
        description="Itens cadastrados"
      />
      <StatCard
        title="Estoque Baixo"
        value={lowStock}
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={{ value: "Requer atenção", isPositive: false }}
      />
      <StatCard
        title="Valor Total"
        value={`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        icon={<Archive className="h-4 w-4" />}
        description="Em estoque"
      />
      <StatCard
        title="Movimentações (Mês)"
        value={movements}
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ value: "+12% vs mês anterior", isPositive: true }}
      />
    </div>
  );
}
