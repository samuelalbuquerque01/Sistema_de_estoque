import RecentMovements from '../RecentMovements'

export default function RecentMovementsExample() {
  const mockMovements = [
    { id: '1', type: 'entrada' as const, productName: 'Monitor Dell 24"', quantity: 10, user: 'João Silva', createdAt: new Date(Date.now() - 1000 * 60 * 15) },
    { id: '2', type: 'saida' as const, productName: 'Teclado Mecânico', quantity: 5, user: 'Maria Santos', createdAt: new Date(Date.now() - 1000 * 60 * 45) },
    { id: '3', type: 'ajuste' as const, productName: 'Papel A4 Sulfite', quantity: 3, user: 'Pedro Costa', createdAt: new Date(Date.now() - 1000 * 60 * 120) },
    { id: '4', type: 'entrada' as const, productName: 'Alicate Universal', quantity: 15, user: 'Ana Paula', createdAt: new Date(Date.now() - 1000 * 60 * 180) },
    { id: '5', type: 'saida' as const, productName: 'Detergente Industrial', quantity: 8, user: 'Carlos Lima', createdAt: new Date(Date.now() - 1000 * 60 * 240) },
  ];

  return <RecentMovements movements={mockMovements} />
}
