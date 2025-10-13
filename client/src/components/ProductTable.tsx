// ProductTable.tsx - CORREÇÃO
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
  location: string;
  quantity: number;
  minQuantity: number;
  unitPrice: string; // ← Agora é string
  type: string;
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
    return <Badge className="bg-yellow-500 text-white border-yellow-500">Estoque Baixo</Badge>;
  } else {
    return <Badge className="bg-green-500 text-white border-green-500">Em Estoque</Badge>;
  }
}

// Função para converter string para number e formatar
function formatPrice(price: string): string {
  const numberPrice = parseFloat(price);
  return `R$ ${numberPrice.toFixed(2)}`;
}

export default function ProductTable({ products, onView, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Local</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Mínimo</TableHead>
            <TableHead className="text-right">Preço Unitário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
              <TableCell className="font-mono font-medium" data-testid={`text-code-${product.id}`}>
                {product.code}
              </TableCell>
              <TableCell className="font-medium" data-testid={`text-name-${product.id}`}>
                {product.name}
              </TableCell>
              <TableCell data-testid={`text-category-${product.id}`}>{product.category}</TableCell>
              <TableCell data-testid={`text-location-${product.id}`}>{product.location}</TableCell>
              <TableCell className="text-right font-mono" data-testid={`text-quantity-${product.id}`}>
                {product.quantity}
              </TableCell>
              <TableCell className="text-right font-mono" data-testid={`text-min-${product.id}`}>
                {product.minQuantity}
              </TableCell>
              <TableCell className="text-right font-mono" data-testid={`text-price-${product.id}`}>
                {formatPrice(product.unitPrice)} {/* ← CORRIGIDO */}
              </TableCell>
              <TableCell>{getStatusBadge(product.quantity, product.minQuantity)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(product)}
                    data-testid={`button-view-${product.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product)}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}