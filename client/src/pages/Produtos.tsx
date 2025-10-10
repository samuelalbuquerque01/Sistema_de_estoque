import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";
import SearchBar from "@/components/SearchBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Produtos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  //todo: remove mock functionality
  const mockProducts = [
    { id: '1', code: 'PROD-001', name: 'Monitor Dell 24"', category: 'Equipamentos', location: 'Almoxarifado A', quantity: 15, minQuantity: 5, unitPrice: 1200.00, type: 'equipamento' },
    { id: '2', code: 'PROD-002', name: 'Teclado Mecânico', category: 'Equipamentos', location: 'Almoxarifado A', quantity: 3, minQuantity: 10, unitPrice: 350.00, type: 'equipamento' },
    { id: '3', code: 'INSU-001', name: 'Papel A4 Sulfite', category: 'Insumos', location: 'Depósito B', quantity: 0, minQuantity: 20, unitPrice: 25.90, type: 'insumo' },
    { id: '4', code: 'FERR-001', name: 'Alicate Universal', category: 'Ferramentas', location: 'Oficina', quantity: 25, minQuantity: 5, unitPrice: 45.00, type: 'ferramenta' },
    { id: '5', code: 'LIMP-001', name: 'Detergente Industrial', category: 'Limpeza', location: 'Depósito C', quantity: 50, minQuantity: 15, unitPrice: 18.50, type: 'limpeza' },
  ];

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

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerenciar todos os produtos do estoque</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="max-w-md">
        <SearchBar 
          placeholder="Buscar produtos por nome ou código..." 
          onSearch={setSearchTerm}
        />
      </div>

      <ProductTable
        products={filteredProducts}
        onView={(product) => console.log('Visualizar:', product)}
        onEdit={(product) => console.log('Editar:', product)}
        onDelete={(product) => console.log('Excluir:', product)}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={mockCategories}
            locations={mockLocations}
            onSubmit={(data) => {
              console.log('Produto criado:', data);
              setIsDialogOpen(false);
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
