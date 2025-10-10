import DashboardStats from "@/components/DashboardStats";
import RecentMovements from "@/components/RecentMovements";
import StockChart from "@/components/StockChart";

export default function Dashboard() {
  //todo: remove mock functionality
  const mockStats = {
    totalProducts: 1247,
    lowStock: 23,
    totalValue: 458932.50,
    movements: 342,
  };

  const mockMovements = [
    { id: '1', type: 'entrada' as const, productName: 'Monitor Dell 24"', quantity: 10, user: 'João Silva', createdAt: new Date(Date.now() - 1000 * 60 * 15) },
    { id: '2', type: 'saida' as const, productName: 'Teclado Mecânico', quantity: 5, user: 'Maria Santos', createdAt: new Date(Date.now() - 1000 * 60 * 45) },
    { id: '3', type: 'ajuste' as const, productName: 'Papel A4 Sulfite', quantity: 3, user: 'Pedro Costa', createdAt: new Date(Date.now() - 1000 * 60 * 120) },
    { id: '4', type: 'entrada' as const, productName: 'Alicate Universal', quantity: 15, user: 'Ana Paula', createdAt: new Date(Date.now() - 1000 * 60 * 180) },
    { id: '5', type: 'saida' as const, productName: 'Detergente Industrial', quantity: 8, user: 'Carlos Lima', createdAt: new Date(Date.now() - 1000 * 60 * 240) },
  ];

  const mockChartData = [
    { name: 'Equipamentos', entrada: 45, saida: 32 },
    { name: 'Insumos', entrada: 78, saida: 65 },
    { name: 'Ferramentas', entrada: 23, saida: 18 },
    { name: 'Limpeza', entrada: 56, saida: 48 },
    { name: 'Outros', entrada: 34, saida: 29 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do estoque e movimentações</p>
      </div>

      <DashboardStats {...mockStats} />

      <div className="grid gap-6 md:grid-cols-2">
        <StockChart data={mockChartData} />
        <RecentMovements movements={mockMovements} />
      </div>
    </div>
  );
}
