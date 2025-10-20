// ProductViewModal.tsx
import { X, Package, MapPin, BarChart3, AlertTriangle, CheckCircle2, FolderOpen, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function getCategoryTypeConfig(type: string) {
  const config = {
    limpeza: { label: "Produto de Limpeza", color: "bg-blue-100 text-blue-800 border-blue-200" },
    ferramenta: { label: "Ferramenta", color: "bg-orange-100 text-orange-800 border-orange-200" },
    insumo: { label: "Insumo", color: "bg-purple-100 text-purple-800 border-purple-200" },
    equipamento: { label: "Equipamento", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    outros: { label: "Outros", color: "bg-gray-100 text-gray-800 border-gray-200" }
  };

  return config[type as keyof typeof config] || config.outros;
}

export default function ProductViewModal({ product, isOpen, onClose }: ProductViewModalProps) {
  if (!product) return null;

  const unitPrice = parseFloat(product.unitPrice || '0');
  const totalValue = unitPrice * product.quantity;
  const status = product.quantity === 0 ? 'sem_estoque' : 
                 product.quantity <= product.minQuantity ? 'estoque_baixo' : 'normal';

  const statusConfig = {
    sem_estoque: {
      label: 'SEM ESTOQUE',
      color: 'destructive',
      icon: AlertTriangle,
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      description: 'Produto sem unidades em estoque'
    },
    estoque_baixo: {
      label: 'ESTOQUE BAIXO',
      color: 'secondary',
      icon: AlertTriangle,
      bgColor: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-800',
      description: 'Estoque abaixo ou igual ao mínimo'
    },
    normal: {
      label: 'EM ESTOQUE',
      color: 'default',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-800',
      description: 'Estoque dentro do esperado'
    }
  };

  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const categoryTypeConfig = getCategoryTypeConfig(product.categoryType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6 text-blue-600" />
            Detalhes do Produto
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className={`flex items-center justify-between p-4 rounded-lg border ${statusInfo.bgColor}`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-5 w-5 ${statusInfo.textColor}`} />
              <div>
                <h3 className={`font-semibold text-lg ${statusInfo.textColor}`}>
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">Código: {product.code}</p>
                <p className="text-xs text-gray-500 mt-1">{statusInfo.description}</p>
              </div>
            </div>
            <Badge variant={statusInfo.color as any} className="text-sm font-medium">
              {statusInfo.label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                Informações do Produto
              </h4>
              
              <div className="space-y-3 bg-gray-50 rounded-lg p-4 border">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Código:</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{product.code}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Categoria:</span>
                  <span className="text-sm text-gray-900">{product.category}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Tipo:</span>
                  <Badge variant="outline" className={categoryTypeConfig.color}>
                    {categoryTypeConfig.label}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">Localização:</span>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-900">{product.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Estoque & Valores
              </h4>
              
              <div className="space-y-3 bg-gray-50 rounded-lg p-4 border">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Quantidade Atual:</span>
                  <span className={`text-sm font-semibold ${
                    product.quantity === 0 ? 'text-red-600' : 
                    product.quantity <= product.minQuantity ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {product.quantity} unidades
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Estoque Mínimo:</span>
                  <span className="text-sm text-gray-900">{product.minQuantity} unidades</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Diferença:</span>
                  <span className={`text-sm font-semibold ${
                    product.quantity >= product.minQuantity ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.quantity - product.minQuantity} unidades
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Preço Unitário:</span>
                  <span className="text-sm font-semibold text-green-700">
                    R$ {unitPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">Valor Total em Estoque:</span>
                  <span className="text-sm font-semibold text-green-700">
                    R$ {totalValue.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {product.description ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <MapPin className="h-5 w-5 text-purple-600" />
                Descrição do Produto
              </h4>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border text-center">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhuma descrição informada para este produto</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className={`text-center p-4 rounded-lg border ${
              product.quantity === 0 ? 'bg-red-50 border-red-200' :
              product.quantity <= product.minQuantity ? 'bg-amber-50 border-amber-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className={`text-2xl font-bold ${
                product.quantity === 0 ? 'text-red-700' :
                product.quantity <= product.minQuantity ? 'text-amber-700' :
                'text-green-700'
              }`}>
                {product.quantity}
              </div>
              <div className={`text-xs font-medium mt-1 ${
                product.quantity === 0 ? 'text-red-600' :
                product.quantity <= product.minQuantity ? 'text-amber-600' :
                'text-green-600'
              }`}>
                Em Estoque
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{product.minQuantity}</div>
              <div className="text-xs font-medium text-blue-600 mt-1">Estoque Mínimo</div>
            </div>
            
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700">
                R$ {totalValue.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-xs font-medium text-emerald-600 mt-1">Valor Total</div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 text-sm mb-2">Informações do Sistema</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
              <div>• Tipo definido pela categoria: <strong>{categoryTypeConfig.label}</strong></div>
              <div>• Status calculado automaticamente</div>
              <div>• Valores atualizados em tempo real</div>
              <div>• Código único: <strong>{product.code}</strong></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t gap-3">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}