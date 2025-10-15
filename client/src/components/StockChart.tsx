// components/StockChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  entrada: number;
  saida: number;
}

interface StockChartProps {
  data: ChartData[];
  timeRange?: 'today' | 'week' | 'month';
}

export default function StockChart({ data, timeRange = 'week' }: StockChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-green-600">
            Entrada: {payload[0].value}
          </p>
          <p className="text-sm text-red-600">
            Saída: {payload[1].value}
          </p>
          <p className="text-sm font-medium">
            Saldo: {payload[0].value - payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações por Categoria</CardTitle>
        <CardDescription>
          Entradas e saídas por categoria de produtos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="entrada" 
                name="Entradas" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="saida" 
                name="Saídas" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <p>Nenhum dado disponível para o gráfico</p>
            <p className="text-sm">Adicione produtos e movimentações para ver os dados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}