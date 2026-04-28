import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";
import ProductViewModal from "@/components/ProductViewModal";
import SearchBar from "@/components/SearchBar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InventoryItemType =
  | "produto"
  | "equipamento"
  | "insumo"
  | "ferramenta"
  | "limpeza";

interface ProdutosProps {
  itemType?: InventoryItemType;
  title?: string;
  description?: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  itemType: InventoryItemType;
  categoryId: string;
  locationId: string;
  quantity: number;
  minQuantity: number;
  unitPrice: string;
  description?: string | null;
}

interface Category {
  id: string;
  name: string;
  type: InventoryItemType;
  description?: string | null;
}

interface Location {
  id: string;
  name: string;
  description?: string | null;
}

interface DisplayProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryType: string;
  location: string;
  quantity: number;
  minQuantity: number;
  unitPrice: string;
  description?: string;
}

export default function Produtos({
  itemType = "produto",
  title = "Produtos",
  description = "Gerenciar os produtos do estoque",
}: ProdutosProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<DisplayProduct | null>(null);

  useEffect(() => {
    void fetchData();
  }, [itemType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, categoriesRes, locationsRes] = await Promise.all([
        fetch(`/api/products?itemType=${itemType}`),
        fetch(`/api/categories?type=${itemType}`),
        fetch("/api/locations"),
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !locationsRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const [productsData, categoriesData, locationsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        locationsRes.json(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getDisplayProduct = (product: Product): DisplayProduct => {
    const category = categories.find((item) => item.id === product.categoryId);
    const location = locations.find((item) => item.id === product.locationId);

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      category: category?.name || "Sem categoria",
      categoryType: product.itemType,
      location: location?.name || "Sem local",
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      unitPrice: product.unitPrice,
      description: product.description || undefined,
    };
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;

        return (
          product.name.toLowerCase().includes(term) ||
          product.code.toLowerCase().includes(term)
        );
      })
      .map(getDisplayProduct);
  }, [products, searchTerm, categories, locations]);

  const handleCreateCategory = async (name: string) => {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type: itemType,
      }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || "Não foi possível criar a categoria");
    }

    setCategories((current) => [...current, responseData]);
    return responseData as Category;
  };

  const handleAddProduct = async (formData: any) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        itemType,
        unitPrice: formData.unitPrice.toString(),
      }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || "Erro ao cadastrar item");
    }

    setProducts((current) => [...current, responseData]);
    setIsDialogOpen(false);
  };

  const handleSaveEdit = async (formData: any) => {
    if (!editingProduct) return;

    const response = await fetch(`/api/products/${editingProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        itemType,
        unitPrice: formData.unitPrice.toString(),
      }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || "Erro ao atualizar item");
    }

    setProducts((current) =>
      current.map((product) => (product.id === editingProduct.id ? responseData : product)),
    );
    setEditingProduct(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteProduct = async (product: DisplayProduct) => {
    if (!confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      return;
    }

    const response = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(responseData.message || responseData.error || "Erro ao excluir item");
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
  };

  const openEditDialog = (product: DisplayProduct) => {
    const original = products.find((item) => item.id === product.id);
    if (!original) return;

    setEditingProduct(original);
    setIsEditDialogOpen(true);
  };

  const openViewModal = (product: DisplayProduct) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cadastro
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Carregando cadastros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <Button onClick={fetchData}>Tentar Novamente</Button>
        </div>
        <div className="flex justify-center items-center h-64 text-destructive">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cadastro
        </Button>
      </div>

      <div className="max-w-md">
        <SearchBar
          placeholder="Buscar por nome ou patrimônio..."
          onSearch={setSearchTerm}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredProducts.length} de {products.length} itens cadastrados
        </p>
      </div>

      <ProductTable
        products={filteredProducts}
        onView={openViewModal}
        onEdit={openEditDialog}
        onDelete={(product) => {
          void handleDeleteProduct(product).catch((deleteError) => {
            alert((deleteError as Error).message);
          });
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cadastro</DialogTitle>
            <DialogDescription>
              Preencha os dados e informe manualmente o número do patrimônio.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            itemType={itemType}
            categories={categories}
            locations={locations}
            onCreateCategory={handleCreateCategory}
            onSubmit={(data) => handleAddProduct(data).catch((submitError) => {
              alert((submitError as Error).message);
            })}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cadastro</DialogTitle>
            <DialogDescription>
              Atualize os dados e ajuste o patrimônio quando necessário.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              itemType={itemType}
              categories={categories}
              locations={locations}
              onCreateCategory={handleCreateCategory}
              onSubmit={(data) => handleSaveEdit(data).catch((submitError) => {
                alert((submitError as Error).message);
              })}
              onCancel={() => {
                setEditingProduct(null);
                setIsEditDialogOpen(false);
              }}
              defaultValues={{
                code: editingProduct.code,
                name: editingProduct.name,
                categoryId: editingProduct.categoryId,
                locationId: editingProduct.locationId,
                quantity: editingProduct.quantity,
                minQuantity: editingProduct.minQuantity,
                unitPrice: Number(editingProduct.unitPrice || "0"),
                description: editingProduct.description || "",
              }}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      <ProductViewModal
        product={viewingProduct}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingProduct(null);
        }}
      />
    </div>
  );
}
