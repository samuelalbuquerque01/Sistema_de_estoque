import StockChart from '../StockChart'

export default function StockChartExample() {
  const mockData = [
    { name: 'Equipamentos', entrada: 45, saida: 32 },
    { name: 'Insumos', entrada: 78, saida: 65 },
    { name: 'Ferramentas', entrada: 23, saida: 18 },
    { name: 'Limpeza', entrada: 56, saida: 48 },
    { name: 'Outros', entrada: 34, saida: 29 },
  ];

  return <StockChart data={mockData} />
}
