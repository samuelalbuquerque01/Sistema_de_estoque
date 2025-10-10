import LocationCard from '../LocationCard'

export default function LocationCardExample() {
  const mockLocations = [
    { id: '1', name: 'Almoxarifado A', description: 'Depósito principal de materiais', productsCount: 245 },
    { id: '2', name: 'Depósito B', description: 'Área de insumos e produtos químicos', productsCount: 89 },
    { id: '3', name: 'Oficina', productsCount: 156 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockLocations.map(location => (
        <LocationCard
          key={location.id}
          location={location}
          onEdit={(loc) => console.log('Editar:', loc)}
          onDelete={(loc) => console.log('Excluir:', loc)}
        />
      ))}
    </div>
  )
}
