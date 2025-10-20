// ProductTable.tsx
import { Edit, Trash2, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
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

interface ProductTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function getStatusBadge(quantity: number, minQuantity: number) {
  if (quantity === 0) {
    return <Badge variant="destructive">Sem Estoque</Badge>;
  } else if (quantity <= minQuantity) {
    return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
      Estoque Baixo
    </Badge>;
  } else {
    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
      Em Estoque
    </Badge>;
  }
}

function getCategoryTypeBadge(type: string) {
  const typeConfig = {
    limpeza: { label: "Limpeza", color: "bg-blue-100 text-blue-800 border-blue-200" },
    ferramenta: { label: "Ferramenta", color: "bg-orange-100 text-orange-800 border-orange-200" },
    insumo: { label: "Insumo", color: "bg-purple-100 text-purple-800 border-purple-200" },
    equipamento: { label: "Equipamento", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    outros: { label: "Outros", color: "bg-gray-100 text-gray-800 border-gray-200" }
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.outros;

  return (
    <Badge variant="secondary" className={`${config.color} hover:${config.color.split(' ')[0]}`}>
      {config.label}
    </Badge>
  );
}

function formatPrice(price: string): string {
  try {
    const numberPrice = parseFloat(price);
    return isNaN(numberPrice) ? "R$ 0,00" : `R$ ${numberPrice.toFixed(2).replace('.', ',')}`;
  } catch {
    return "R$ 0,00";
  }
}

function formatQuantity(quantity: number, minQuantity: number): { value: string; className: string } {
  if (quantity === 0) {
    return { value: "0", className: "text-red-600 font-semibold" };
  } else if (quantity <= minQuantity) {
    return { value: quantity.toString(), className: "text-amber-600 font-semibold" };
  } else {
    return { value: quantity.toString(), className: "text-green-600" };
  }
}

export default function ProductTable({ products, onView, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum produto encontrado</h3>
        <p className="text-sm text-muted-foreground">
          {products.length === 0 ? "Comece adicionando seu primeiro produto." : "Tente ajustar os filtros de busca."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Lista de Produtos</h3>
            <p className="text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>
          <Badge variant="outline" className="bg-background">
            Total: {products.length}
          </Badge>
        </div>
      </div>

      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Código</TableHead>
              <TableHead className="min-w-[200px]">Produto</TableHead>
              <TableHead className="w-[120px]">Categoria</TableHead>
              <TableHead className="w-[100px]">Tipo</TableHead>
              <TableHead className="w-[140px]">Localização</TableHead>
              <TableHead className="text-right w-[100px]">Quantidade</TableHead>
              <TableHead className="text-right w-[100px]">Mínimo</TableHead>
              <TableHead className="text-right w-[120px]">Preço Unit.</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[140px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const quantityInfo = formatQuantity(product.quantity, product.minQuantity);
              
              return (
                <TableRow 
                  key={product.id} 
                  className="group hover:bg-muted/50 transition-colors"
                  data-testid={`row-product-${product.id}`}
                >
                  <TableCell className="font-mono text-sm" data-testid={`text-code-${product.id}`}>
                    <div className="font-medium">{product.code}</div>
                  </TableCell>

                  <TableCell data-testid={`text-name-${product.id}`}>
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {product.description}
                      </div>
                    )}
                  </TableCell>

                  <TableCell data-testid={`text-category-${product.id}`}>
                    <div className="text-sm">{product.category}</div>
                  </TableCell>

                  <TableCell>
                    {getCategoryTypeBadge(product.categoryType)}
                  </TableCell>

                  <TableCell data-testid={`text-location-${product.id}`}>
                    <div className="text-sm">{product.location}</div>
                  </TableCell>

                  <TableCell className="text-right font-mono" data-testid={`text-quantity-${product.id}`}>
                    <span className={quantityInfo.className}>
                      {quantityInfo.value}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-mono" data-testid={`text-min-${product.id}`}>
                    {product.minQuantity}
                  </TableCell>

                  <TableCell className="text-right font-mono" data-testid={`text-price-${product.id}`}>
                    <div className="font-medium">{formatPrice(product.unitPrice)}</div>
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(product.quantity, product.minQuantity)}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(product)}
                        className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700"
                        data-testid={`button-view-${product.id}`}
                        title="Visualizar produto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 hover:bg-green-100 hover:text-green-700"
                        data-testid={`button-edit-${product.id}`}
                        title="Editar produto"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(product)}
                        className="h-8 w-8 hover:bg-red-100 hover:text-red-700"
                        data-testid={`button-delete-${product.id}`}
                        title="Excluir produto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="p-3 border-t bg-muted/20">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex gap-4">
            <span>
              Em estoque: {products.filter(p => p.quantity > p.minQuantity).length}
            </span>
            <span>
              Estoque baixo: {products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length}
            </span>
            <span>
              Sem estoque: {products.filter(p => p.quantity === 0).length}
            </span>
          </div>
          <div>
            Valor total: {formatPrice(
              products.reduce((sum, p) => sum + (parseFloat(p.unitPrice) * p.quantity), 0).toString()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}