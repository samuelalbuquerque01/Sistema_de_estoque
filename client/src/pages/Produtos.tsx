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
      type: product.type
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

  // Função para adicionar novo produto - CORRIGIDA
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

  // Função para editar produto
  const handleEditProduct = async (product: DisplayProduct) => {
    console.log('Editar produto:', product);
    // Implementar lógica de edição aqui
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
        } else {
          throw new Error('Erro ao excluir produto');
        }
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
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
        onView={(product) => console.log('Visualizar:', product)}
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
    </div>
  );
}