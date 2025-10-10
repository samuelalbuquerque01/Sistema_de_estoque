import ProductForm from '../ProductForm'

export default function ProductFormExample() {
  const mockCategories = [
    { id: '1', name: 'Eletrônicos' },
    { id: '2', name: 'Escritório' },
    { id: '3', name: 'Ferramentas' },
  ];

  const mockLocations = [
    { id: '1', name: 'Almoxarifado A' },
    { id: '2', name: 'Depósito B' },
    { id: '3', name: 'Oficina' },
  ];

  return (
    <div className="max-w-4xl">
      <ProductForm
        categories={mockCategories}
        locations={mockLocations}
        onSubmit={(data) => console.log('Produto salvo:', data)}
        onCancel={() => console.log('Cancelado')}
      />
    </div>
  )
}
