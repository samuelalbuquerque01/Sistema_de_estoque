// Produtos.tsx - CÓDIGO COMPLETO CORRIGIDO
import { useState, useEffect } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";

interface ProdutosProps {
  category?: string;
  title?: string;
  description?: string;
}

// Interface do produto vinda da API
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

// Interface para o ProductTable (com nomes em vez de IDs)
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

  // Carregar dados da API
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
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para converter IDs em nomes para exibição
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

  // Função para gerar código único
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

  // 🔥 FUNÇÃO VISUALIZAR PRODUTO COMPLETA
  const handleViewProduct = async (product: DisplayProduct) => {
    try {
      console.log('👀 Visualizando produto:', product);
      
      // Buscar dados completos do produto da API
      const response = await fetch(`/api/products/${product.id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes do produto');
      }

      const productDetails = await response.json();
      
      // Buscar categoria e localização reais
      const category = categories.find(cat => cat.id === productDetails.categoryId);
      const location = locations.find(loc => loc.id === productDetails.locationId);
      
      // Mostrar detalhes completos
      const detailsMessage = `
📦 DETALHES DO PRODUTO

🔹 Código: ${productDetails.code}
🔹 Nome: ${productDetails.name}
🔹 Categoria: ${category?.name || 'Desconhecida'}
🔹 Localização: ${location?.name || 'Desconhecido'}
🔹 Quantidade: ${productDetails.quantity}
🔹 Estoque Mínimo: ${productDetails.minQuantity}
🔹 Preço Unitário: R$ ${parseFloat(productDetails.unitPrice || '0').toFixed(2)}
🔹 Tipo: ${productDetails.type}
🔹 Descrição: ${productDetails.description || 'Nenhuma descrição'}

📊 Status: ${productDetails.quantity === 0 ? 'SEM ESTOQUE' : 
              productDetails.quantity <= productDetails.minQuantity ? 'ESTOQUE BAIXO' : 'NORMAL'}
      `.trim();

      alert(detailsMessage);
      
    } catch (error) {
      console.error('❌ Erro ao visualizar produto:', error);
      alert('Erro ao carregar detalhes do produto:\n' + (error as Error).message);
    }
  };

  // 🔥 FUNÇÃO EDITAR PRODUTO COMPLETA
  const handleEditProduct = async (product: DisplayProduct) => {
    try {
      console.log('📝 Iniciando edição do produto:', product);
      
      // Buscar o produto original para obter os IDs
      const originalProduct = products.find(p => p.id === product.id);
      if (!originalProduct) {
        throw new Error('Produto não encontrado');
      }

      // Buscar dados completos do produto
      const response = await fetch(`/api/products/${product.id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do produto para edição');
      }

      const productDetails = await response.json();
      
      // Preparar dados para edição
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

      // Configurar produto para edição e abrir dialog
      setEditingProduct(productToEdit);
      setIsEditDialogOpen(true);

    } catch (error) {
      console.error('❌ Erro ao preparar edição do produto:', error);
      alert('Erro ao carregar dados do produto para edição:\n' + (error as Error).message);
    }
  };

  // 🔥 FUNÇÃO PARA SALVAR EDIÇÃO DO PRODUTO
  const handleSaveEdit = async (formData: any) => {
    try {
      if (!editingProduct) return;

      console.log('💾 Salvando edição do produto:', editingProduct.id);
      console.log('Dados do formulário:', formData);

      // Encontrar IDs da categoria e localização selecionadas
      const selectedCategory = categories.find(cat => cat.name === formData.categoryId);
      const selectedLocation = locations.find(loc => loc.name === formData.locationId);

      if (!selectedCategory || !selectedLocation) {
        throw new Error('Categoria ou localização inválida');
      }

      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        categoryId: selectedCategory.id,
        locationId: selectedLocation.id,
        unitPrice: formData.unitPrice.toString() // Garantir que é string
      };

      console.log('Dados enviados para API:', dataToSend);

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
      
      // Atualizar lista de produtos
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      ));

      // Fechar dialog e limpar estado
      setIsEditDialogOpen(false);
      setEditingProduct(null);

      console.log('✅ Produto editado com sucesso:', updatedProduct);
      alert('Produto atualizado com sucesso!');

      // Recarregar dados para garantir sincronização
      fetchData();

    } catch (error) {
      console.error('❌ Erro ao editar produto:', error);
      alert('Erro ao editar produto:\n' + (error as Error).message);
    }
  };

  // 🔥 FUNÇÃO PARA CANCELAR EDIÇÃO
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setIsEditDialogOpen(false);
  };

  // Função para adicionar novo produto
  const handleAddProduct = async (formData: any) => {
    try {
      console.log('=== DEBUG: INICIANDO CADASTRO ===');
      console.log('Dados do formulário:', formData);
      
      // Se o código estiver vazio ou já existir, gerar um automático
      let finalCode = formData.code;
      if (!finalCode || products.some(p => p.code === finalCode)) {
        finalCode = generateUniqueCode('PROD');
        console.log('Código gerado automaticamente:', finalCode);
      }
      
      // SOLUÇÃO: Enviar unitPrice como string
      const dataToSend = {
        ...formData,
        code: finalCode,
        unitPrice: formData.unitPrice.toString() // ← CONVERTER PARA STRING
      };

      console.log('Dados após conversão:', dataToSend);
      console.log('JSON sendo enviado:', JSON.stringify(dataToSend, null, 2));

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      console.log('Status da resposta:', response.status);
      console.log('OK?', response.ok);

      const responseData = await response.json();
      console.log('Resposta completa da API:', responseData);

      if (!response.ok) {
        // Mostrar TODOS os detalhes do erro
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
      
      console.log('✅ Produto cadastrado com sucesso:', newProduct);
    } catch (error) {
      console.error('❌ Erro completo ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto:\n\n' + (error as Error).message);
    }
  };

  // Função para excluir produto
  const handleDeleteProduct = async (product: DisplayProduct) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProducts(prev => prev.filter(p => p.id !== product.id));
          console.log('Produto excluído:', product);
          alert('Produto excluído com sucesso!');
        } else {
          throw new Error('Erro ao excluir produto');
        }
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto:\n' + (error as Error).message);
      }
    }
  };

  // FILTRO CORRIGIDO: Filtrar produtos por categoria e busca
  const filteredProducts = products
    .filter(product => {
      // Se não há categoria definida, mostrar todos os produtos
      if (!category) return true;
      
      // Buscar a categoria do produto para verificar o tipo
      const productCategory = categories.find(cat => cat.id === product.categoryId);
      
      // Filtrar pelo tipo da categoria
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

      {/* Dialog para Novo Produto */}
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

      {/* 🔥 Dialog para Editar Produto */}
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
    </div>
  );
}