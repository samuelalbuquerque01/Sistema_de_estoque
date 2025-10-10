import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  type: string;
}

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export default function ProductTable({ products, onEdit, onDelete, onView }: ProductTableProps) {
  const getStatusBadge = (quantity: number, minQuantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive" data-testid={`badge-status-esgotado`}>Esgotado</Badge>;
    }
    if (quantity <= minQuantity) {
      return <Badge className="bg-chart-3 text-white border-chart-3" data-testid={`badge-status-baixo`}>Baixo</Badge>;
    }
    return <Badge className="bg-chart-2 text-white border-chart-2" data-testid={`badge-status-ok`}>OK</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Local</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Mín.</TableHead>
            <TableHead className="text-right">Preço Unit.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
              <TableCell className="font-mono text-sm" data-testid={`text-code-${product.id}`}>{product.code}</TableCell>
              <TableCell className="font-medium" data-testid={`text-name-${product.id}`}>{product.name}</TableCell>
              <TableCell data-testid={`text-category-${product.id}`}>{product.category}</TableCell>
              <TableCell data-testid={`text-location-${product.id}`}>{product.location}</TableCell>
              <TableCell className="text-right font-mono" data-testid={`text-quantity-${product.id}`}>{product.quantity}</TableCell>
              <TableCell className="text-right font-mono" data-testid={`text-min-${product.id}`}>{product.minQuantity}</TableCell>
              <TableCell className="text-right font-mono" data-testid={`text-price-${product.id}`}>
                R$ {product.unitPrice.toFixed(2)}
              </TableCell>
              <TableCell>{getStatusBadge(product.quantity, product.minQuantity)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid={`button-actions-${product.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(product)} data-testid={`menu-view-${product.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(product)} data-testid={`menu-edit-${product.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(product)} 
                      className="text-destructive"
                      data-testid={`menu-delete-${product.id}`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
