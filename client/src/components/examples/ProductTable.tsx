import ProductTable from '../ProductTable'

export default function ProductTableExample() {
  const mockProducts = [
    { id: '1', code: 'PROD-001', name: 'Monitor Dell 24"', category: 'Equipamentos', location: 'Almoxarifado A', quantity: 15, minQuantity: 5, unitPrice: 1200.00, type: 'equipamento' },
    { id: '2', code: 'PROD-002', name: 'Teclado Mecânico', category: 'Equipamentos', location: 'Almoxarifado A', quantity: 3, minQuantity: 10, unitPrice: 350.00, type: 'equipamento' },
    { id: '3', code: 'INSU-001', name: 'Papel A4 Sulfite', category: 'Insumos', location: 'Depósito B', quantity: 0, minQuantity: 20, unitPrice: 25.90, type: 'insumo' },
    { id: '4', code: 'FERR-001', name: 'Alicate Universal', category: 'Ferramentas', location: 'Oficina', quantity: 25, minQuantity: 5, unitPrice: 45.00, type: 'ferramenta' },
  ];

  return (
    <ProductTable
      products={mockProducts}
      onView={(product) => console.log('Visualizar:', product)}
      onEdit={(product) => console.log('Editar:', product)}
      onDelete={(product) => console.log('Excluir:', product)}
    />
  )
}
