// components/InventorySummary.tsx
import { Package, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategorySummary {
  name: string;
  count: number;
  value: number;
}

interface LocationSummary {
  name: string;
  productCount: number;
  totalValue: number;
}

interface InventorySummaryProps {
  categories: CategorySummary[];
  locations: LocationSummary[];
}

export default function InventorySummary({ categories, locations }: InventorySummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Categorias */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Por Categoria
            <Badge variant="outline">{categories.length}</Badge>
          </CardTitle>
          <CardDescription>
            Distribuição de produtos por categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.slice(0, 5).map((category, index) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {category.count} produto(s)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(category.value)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((category.value / categories.reduce((sum, c) => sum + c.value, 0)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma categoria encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localizações */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Por Localização
            <Badge variant="outline">{locations.length}</Badge>
          </CardTitle>
          <CardDescription>
            Produtos distribuídos por local
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {locations.slice(0, 5).map((location, index) => (
            <div key={location.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{location.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {location.productCount} produto(s)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(location.totalValue)}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {((location.productCount / locations.reduce((sum, l) => sum + l.productCount, 0)) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          ))}
          
          {locations.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma localização encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}