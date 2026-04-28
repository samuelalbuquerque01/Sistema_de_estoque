import ProductForm from "../ProductForm";

export default function ProductFormExample() {
  const mockCategories = [
    { id: "1", name: "Eletrônicos", type: "produto" as const },
    { id: "2", name: "Escritório", type: "produto" as const },
    { id: "3", name: "Ferramentas", type: "produto" as const },
  ];

  const mockLocations = [
    { id: "1", name: "Almoxarifado A" },
    { id: "2", name: "Depósito B" },
    { id: "3", name: "Oficina" },
  ];

  return (
    <div className="max-w-4xl">
      <ProductForm
        itemType="produto"
        categories={mockCategories}
        locations={mockLocations}
        onCreateCategory={async (name) => ({ id: name, name, type: "produto" })}
        onSubmit={(data) => console.log("Produto salvo:", data)}
        onCancel={() => console.log("Cancelado")}
      />
    </div>
  );
}
