import { MapPin, Package, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Location {
  id: string;
  name: string;
  description?: string;
  productsCount: number;
}

interface LocationCardProps {
  location: Location;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
}

export default function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  return (
    <Card data-testid={`card-location-${location.id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base" data-testid={`text-name-${location.id}`}>
              {location.name}
            </CardTitle>
            {location.description && (
              <p className="text-xs text-muted-foreground mt-1" data-testid={`text-description-${location.id}`}>
                {location.description}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-actions-${location.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(location)} data-testid={`menu-edit-${location.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(location)} 
              className="text-destructive"
              data-testid={`menu-delete-${location.id}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span data-testid={`text-count-${location.id}`}>
            {location.productsCount} {location.productsCount === 1 ? 'produto' : 'produtos'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
