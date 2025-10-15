// components/QuickActions.tsx - VERSÃO CORRIGIDA
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  TrendingUp, 
  FileText, 
  Upload,
  AlertTriangle,
  PackageX
} from "lucide-react";

interface QuickActionsProps {
  lowStockCount: number;
  outOfStockCount: number;
  onViewLowStock: () => void;
  onAddProduct: () => void;
  onAddMovement: () => void;
  onViewReports: () => void;
  onImportProducts: () => void;
}

export default function QuickActions({
  lowStockCount,
  outOfStockCount,
  onViewLowStock,
  onAddProduct,
  onAddMovement,
  onViewReports,
  onImportProducts
}: QuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      label: "Novo Produto",
      description: "Cadastrar novo produto",
      onClick: onAddProduct,
      variant: "default" as const
    },
    {
      icon: TrendingUp,
      label: "Nova Movimentação",
      description: "Registrar entrada/saída",
      onClick: onAddMovement,
      variant: "outline" as const
    },
    {
      icon: AlertTriangle,
      label: `Estoque Baixo (${lowStockCount})`,
      description: "Ver produtos críticos",
      onClick: onViewLowStock,
      variant: lowStockCount > 0 ? "destructive" : "outline" as const
    },
    {
      icon: PackageX,
      label: `Sem Estoque (${outOfStockCount})`,
      description: "Produtos esgotados",
      onClick: onViewLowStock,
      variant: outOfStockCount > 0 ? "destructive" : "outline" as const
    },
    {
      icon: FileText,
      label: "Relatórios",
      description: "Gerar relatórios",
      onClick: onViewReports,
      variant: "outline" as const
    },
    {
      icon: Upload,
      label: "Importar XML",
      description: "Importar nota fiscal",
      onClick: onImportProducts,
      variant: "outline" as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
        <CardDescription>
          Acesso rápido às funcionalidades principais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.onClick}
              className="h-auto py-3 px-4 justify-start gap-3 hover:scale-105 transition-transform"
            >
              <action.icon className="h-4 w-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs opacity-70">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}