// Produtos.tsx - CÓDIGO COMPLETO ATUALIZADO COM MODAL PROFISSIONAL
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";
import ProductViewModal from "@/components/ProductViewModal";
import SearchBar from "@/components/SearchBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProdutosProps {
  category?: string;
  title?: string;
  description?: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  locationId: string;
  quantity: number;
  minQuantity: number;
  unitPrice: string;
  description?: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Location {
  id: string;
  name: string;
  description?: string;
}

interface DisplayProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  minQuantity: number;
  unitPrice: string;
  type: string;
  description?: string;
}

export default function Produtos({ 
  category, 
  title = "Produtos", 
  description = "Gerenciar todos os produtos do estoque" 
}: ProdutosProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<DisplayProduct | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<DisplayProduct | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsRes, categoriesRes, locationsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/locations')
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !locationsRes.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const locationsData = await locationsRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (error) {
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getProductForDisplay = (product: Product): DisplayProduct => {
    const category = categories.find(cat => cat.id === product.categoryId);
    const location = locations.find(loc => loc.id === product.locationId);
    
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      category: category?.name || 'Desconhecida',
      location: location?.name || 'Desconhecido',
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      unitPrice: product.unitPrice,
      type: product.type,
      description: product.description
    };
  };

  const generateUniqueCode = (baseCode: string): string => {
    const existingCodes = products.map(p => p.code);
    let newCode = baseCode;
    let counter = 1;
    
    while (existingCodes.includes(newCode)) {
      newCode = `${baseCode}-${counter}`;
      counter++;
    }
    
    return newCode;
  };

  const handleViewProduct = async (product: DisplayProduct) => {
    try {
      const response = await fetch(`/api/products/${product.id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes do produto');
      }

      const productDetails = await response.json();
      
      const category = categories.find(cat => cat.id === productDetails.categoryId);
      const location = locations.find(loc => loc.id === productDetails.locationId);
      
      const productForModal: DisplayProduct = {
        id: productDetails.id,
        code: productDetails.code,
        name: productDetails.name,
        category: category?.name || 'Desconhecida',
        location: location?.name || 'Desconhecido',
        quantity: productDetails.quantity,
        minQuantity: productDetails.minQuantity,
        unitPrice: productDetails.unitPrice,
        type: productDetails.type,
        description: productDetails.description
      };

      setViewingProduct(productForModal);
      setIsViewModalOpen(true);

    } catch (error) {
      alert('Erro ao carregar detalhes do produto:\n' + (error as Error).message);
    }
  };

  const handleEditProduct = async (product: DisplayProduct) => {
    try {
      const originalProduct = products.find(p => p.id === product.id);
      if (!originalProduct) {
        throw new Error('Produto não encontrado');
      }

      const response = await fetch(`/api/products/${product.id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do produto para edição');
      }

      const productDetails = await response.json();
      
      const productToEdit: DisplayProduct = {
        id: productDetails.id,
        code: productDetails.code,
        name: productDetails.name,
        category: categories.find(cat => cat.id === productDetails.categoryId)?.name || 'Desconhecida',
        location: locations.find(loc => loc.id === productDetails.locationId)?.name || 'Desconhecido',
        quantity: productDetails.quantity,
        minQuantity: productDetails.minQuantity,
        unitPrice: productDetails.unitPrice,
        type: productDetails.type,
        description: productDetails.description
      };

      setEditingProduct(productToEdit);
      setIsEditDialogOpen(true);

    } catch (error) {
      alert('Erro ao carregar dados do produto para edição:\n' + (error as Error).message);
    }
  };

  const handleSaveEdit = async (formData: any) => {
    try {
      if (!editingProduct) return;

      const selectedCategory = categories.find(cat => cat.name === formData.categoryId);
      const selectedLocation = locations.find(loc => loc.name === formData.locationId);

      if (!selectedCategory || !selectedLocation) {
        throw new Error('Categoria ou localização inválida');
      }

      const dataToSend = {
        ...formData,
        categoryId: selectedCategory.id,
        locationId: selectedLocation.id,
        unitPrice: formData.unitPrice.toString()
      };

      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar produto');
      }

      const updatedProduct = await response.json();
      
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      ));

      setIsEditDialogOpen(false);
      setEditingProduct(null);

      alert('Produto atualizado com sucesso!');
      fetchData();

    } catch (error) {
      alert('Erro ao editar produto:\n' + (error as Error).message);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setIsEditDialogOpen(false);
  };

  const handleAddProduct = async (formData: any) => {
    try {
      let finalCode = formData.code;
      if (!finalCode || products.some(p => p.code === finalCode)) {
        finalCode = generateUniqueCode('PROD');
      }
      
      const dataToSend = {
        ...formData,
        code: finalCode,
        unitPrice: formData.unitPrice.toString()
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.details && Array.isArray(responseData.details)) {
          const errorDetails = responseData.details.map((detail: any) => 
            `Campo: ${detail.path?.join('.') || 'desconhecido'}\nErro: ${detail.message}\nValor recebido: ${detail.received}\nEsperado: ${detail.expected}`
          ).join('\n\n');
          
          throw new Error(`Erro de validação:\n\n${errorDetails}`);
        } else if (responseData.error) {
          throw new Error(responseData.error);
        } else {
          throw new Error('Erro desconhecido ao criar produto');
        }
      }

      const newProduct = responseData;
      setProducts(prev => [...prev, newProduct]);
      setIsDialogOpen(false);
      
    } catch (error) {
      alert('Erro ao cadastrar produto:\n\n' + (error as Error).message);
    }
  };

  const handleDeleteProduct = async (product: DisplayProduct) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProducts(prev => prev.filter(p => p.id !== product.id));
          alert('Produto excluído com sucesso!');
          fetchData();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status} ao excluir produto`);
        }
      } catch (error) {
        let errorMessage = 'Erro ao excluir produto';
        
        if (error instanceof Error) {
          if (error.message.includes('500')) {
            errorMessage = 'Erro interno do servidor. O produto pode estar vinculado a movimentações ou inventários.';
          } else {
            errorMessage = error.message;
          }
        }
        
        alert(`Erro ao excluir produto:\n\n${errorMessage}\n\nTente novamente ou contate o suporte.`);
      }
    }
  };

  const filteredProducts = products
    .filter(product => {
      if (!category) return true;
      
      const productCategory = categories.find(cat => cat.id === product.categoryId);
      
      return productCategory?.type === category;
    })
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(getProductForDisplay);

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
            Novo Produto
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Carregando produtos...</p>
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
          <Button onClick={fetchData}>
            Tentar Novamente
          </Button>
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
          Novo Produto
        </Button>
      </div>

      <div className="max-w-md">
        <SearchBar 
          placeholder="Buscar produtos por nome ou código..." 
          onSearch={setSearchTerm}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredProducts.length} de {products.length} produtos
          {category && ` na categoria ${category}`}
        </p>
      </div>

      <ProductTable
        products={filteredProducts}
        onView={handleViewProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo produto
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            categories={categories}
            locations={locations}
            onSubmit={handleAddProduct}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Edite os dados do produto {editingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              categories={categories}
              locations={locations}
              onSubmit={handleSaveEdit}
              onCancel={handleCancelEdit}
              initialData={{
                ...editingProduct,
                categoryId: editingProduct.category,
                locationId: editingProduct.location
              }}
              isEditing={true}
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