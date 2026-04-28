import ProductTable from "../ProductTable";

export default function ProductTableExample() {
  const mockProducts = [
    {
      id: "1",
      code: "PATR-001",
      name: 'Monitor Dell 24"',
      category: "Equipamentos",
      categoryType: "equipamento",
      location: "Almoxarifado A",
      quantity: 15,
      minQuantity: 5,
      unitPrice: "1200.00",
    },
    {
      id: "2",
      code: "PATR-002",
      name: "Teclado Mecânico",
      category: "Equipamentos",
      categoryType: "equipamento",
      location: "Almoxarifado A",
      quantity: 3,
      minQuantity: 10,
      unitPrice: "350.00",
    },
    {
      id: "3",
      code: "PATR-003",
      name: "Papel A4 Sulfite",
      category: "Insumos",
      categoryType: "insumo",
      location: "Depósito B",
      quantity: 0,
      minQuantity: 20,
      unitPrice: "25.90",
    },
    {
      id: "4",
      code: "PATR-004",
      name: "Alicate Universal",
      category: "Ferramentas",
      categoryType: "ferramenta",
      location: "Oficina",
      quantity: 25,
      minQuantity: 5,
      unitPrice: "45.00",
    },
  ];

  return (
    <ProductTable
      products={mockProducts}
      onView={(product) => console.log("Visualizar:", product)}
      onEdit={(product) => console.log("Editar:", product)}
      onDelete={(product) => console.log("Excluir:", product)}
    />
  );
}
