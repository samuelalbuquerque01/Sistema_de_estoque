import InventoryList from '../InventoryList'

export default function InventoryListExample() {
  const mockInventories = [
    { id: '1', name: 'Inventário Mensal - Janeiro 2025', status: 'em_andamento' as const, user: 'João Silva', createdAt: new Date(2025, 0, 10), itemsCount: 45 },
    { id: '2', name: 'Inventário Semestral 2024', status: 'finalizado' as const, user: 'Maria Santos', createdAt: new Date(2024, 11, 20), finishedAt: new Date(2024, 11, 22), itemsCount: 523 },
    { id: '3', name: 'Contagem Rápida - Ferramentas', status: 'em_andamento' as const, user: 'Pedro Costa', createdAt: new Date(2025, 0, 8), itemsCount: 12 },
    { id: '4', name: 'Inventário Anual 2024', status: 'finalizado' as const, user: 'Ana Paula', createdAt: new Date(2024, 11, 1), finishedAt: new Date(2024, 11, 15), itemsCount: 1247 },
  ];

  return (
    <InventoryList
      inventories={mockInventories}
      onView={(inv) => console.log('Visualizar:', inv)}
      onFinalize={(inv) => console.log('Finalizar:', inv)}
    />
  )
}
