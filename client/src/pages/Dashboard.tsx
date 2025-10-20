// Dashboard.tsx - VERSÃO CORRIGIDA
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardStats from "@/components/DashboardStats";
import RecentMovements from "@/components/RecentMovements";
import StockChart from "@/components/StockChart";
import LowStockAlerts from "@/components/LowStockAlerts";
import QuickActions from "@/components/QuickActions";
import InventorySummary from "@/components/InventorySummary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDashboardData(data);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÕES DE NAVEGAÇÃO
  const handleViewLowStock = () => {
    navigate('/produtos?filter=low-stock');
  };

  const handleViewMovements = () => {
    navigate('/movimentacoes');
  };

  const handleAddProduct = () => {
    navigate('/produtos');
  };

  const handleAddMovement = () => {
    navigate('/movimentacoes');
  };

  const handleViewReports = () => {
    navigate('/relatorios');
  };

  const handleImportProducts = () => {
    navigate('/importacao');
  };

  // ESTADO VAZIO MELHORADO
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Carregando dados do estoque...</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
        
        {/* Skeleton Loader */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do estoque e movimentações</p>
          </div>
        </div>
        
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-destructive text-center">
              <AlertTriangle className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">Erro ao carregar dashboard</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={fetchDashboardData}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do estoque e movimentações</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum dado disponível</h3>
            <p className="text-muted-foreground mb-6">
              Não foi possível carregar os dados do dashboard
            </p>
            <Button 
              onClick={fetchDashboardData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Carregar Dados
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔥 CORREÇÃO: Garantir que o valor do estoque seja formatado corretamente
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const criticalAlerts = dashboardData.criticalProducts?.map((alert: any) => ({
    product: alert.product,
    urgency: alert.urgency,
    message: alert.message
  })) || [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do estoque e movimentações - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        <Button 
          onClick={fetchDashboardData}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Principais - COM VALOR CORRIGIDO */}
      <DashboardStats 
        totalProducts={dashboardData.totalProducts}
        lowStock={dashboardData.lowStock}
        outOfStock={dashboardData.outOfStock}
        totalValue={dashboardData.totalValue}
        movements={dashboardData.movements}
        movementStats={dashboardData.movementStats}
      />

      {/* Layout Principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico */}
          <StockChart 
            data={dashboardData.chartData || []} 
            timeRange="week"
          />
          
          {/* Alertas e Ações Rápidas */}
          <div className="grid gap-6 md:grid-cols-2">
            <LowStockAlerts 
              alerts={criticalAlerts}
              onViewAll={handleViewLowStock}
            />
            
            <QuickActions 
              lowStockCount={dashboardData.lowStock || 0}
              outOfStockCount={dashboardData.outOfStock || 0}
              onViewLowStock={handleViewLowStock}
              onAddProduct={handleAddProduct}
              onAddMovement={handleAddMovement}
              onViewReports={handleViewReports}
              onImportProducts={handleImportProducts}
            />
          </div>
        </div>

        {/* Sidebar Direita */}
        <div className="space-y-6">
          <RecentMovements 
            movements={dashboardData.recentMovements || []}
            onViewAll={handleViewMovements}
          />
          
          <InventorySummary 
            categories={dashboardData.categories || []}
            locations={dashboardData.locations || []}
          />
        </div>
      </div>
    </div>
  );
}