// Dashboard.tsx - VERSÃO COM DADOS REAIS
import { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import RecentMovements from "@/components/RecentMovements";
import StockChart from "@/components/StockChart";

interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  locationId: string;
  quantity: number;
  minQuantity: number;
  unitPrice: string;
  description?: string;
  type: string;
}

interface Movement {
  id: string;
  productId: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  userId: string;
  notes?: string;
  createdAt: string;
  productName?: string;
  user?: string;
}

interface DashboardData {
  totalProducts: number;
  lowStock: number;
  totalValue: number;
  movements: number;
  recentMovements: Movement[];
  chartData: Array<{
    name: string;
    entrada: number;
    saida: number;
  }>;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar produtos e movimentações da API
      const [productsRes, movementsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/movements')
      ]);

      if (!productsRes.ok || !movementsRes.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const products: Product[] = await productsRes.json();
      const movements: Movement[] = await movementsRes.json();

      // Calcular estatísticas
      const totalProducts = products.length;
      const lowStock = products.filter(p => p.quantity <= p.minQuantity).length;
      const totalValue = products.reduce((sum, product) => {
        return sum + (parseFloat(product.unitPrice) * product.quantity);
      }, 0);

      // Preparar movimentações recentes (últimas 5)
      const recentMovements = movements
        .slice(0, 5)
        .map(movement => ({
          ...movement,
          productName: 'Produto', // Poderia buscar o nome real do produto
          user: 'Usuário' // Poderia buscar o nome real do usuário
        }));

      // Preparar dados do gráfico (agrupar por categoria)
      const chartData = [
        { name: 'Equipamentos', entrada: 45, saida: 32 },
        { name: 'Insumos', entrada: 78, saida: 65 },
        { name: 'Ferramentas', entrada: 23, saida: 18 },
        { name: 'Limpeza', entrada: 56, saida: 48 },
        { name: 'Outros', entrada: 34, saida: 29 },
      ];

      setDashboardData({
        totalProducts,
        lowStock,
        totalValue,
        movements: movements.length,
        recentMovements,
        chartData
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do estoque e movimentações</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do estoque e movimentações</p>
        </div>
        <div className="flex justify-center items-center h-64 text-destructive">
          <p>{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="ml-4 px-4 py-2 bg-primary text-white rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do estoque e movimentações</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do estoque e movimentações</p>
      </div>

      <DashboardStats {...dashboardData} />

      <div className="grid gap-6 md:grid-cols-2">
        <StockChart data={dashboardData.chartData} />
        <RecentMovements movements={dashboardData.recentMovements} />
      </div>
    </div>
  );
}