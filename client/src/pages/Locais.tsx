// Locais.tsx - VERSÃO COMPLETA CORRIGIDA (SEM EXPOSIÇÃO DO ID)
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Location {
  id: string;
  name: string;
  description?: string;
  productsCount?: number;
}

function LocationCard({ 
  location, 
  onEdit, 
  onDelete 
}: { 
  location: Location; 
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{location.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {location.description || "Sem descrição"}
            </CardDescription>
          </div>
          <div className="flex gap-1 flex-shrink-0 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(location)}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
              title="Editar local"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(location)}
              className="h-8 w-8 p-0 text-destructive hover:bg-red-50 hover:text-destructive"
              title="Excluir local"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge 
            variant={location.productsCount && location.productsCount > 0 ? "default" : "secondary"}
            className="text-xs"
          >
            {location.productsCount || 0} {location.productsCount === 1 ? 'produto' : 'produtos'}
          </Badge>
          
          <div className="flex items-center gap-2">
            {location.productsCount && location.productsCount > 0 ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Em uso</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-xs text-muted-foreground">Vazio</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Locais() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/locations');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar locais');
      }

      const locationsData: Location[] = await response.json();
      
      const locationsWithCounts = await Promise.all(
        locationsData.map(async (location) => {
          const productsResponse = await fetch('/api/products');
          if (productsResponse.ok) {
            const products = await productsResponse.json();
            const productsCount = products.filter((product: any) => 
              product.locationId === location.id
            ).length;
            return { ...location, productsCount };
          }
          return location;
        })
      );

      setLocations(locationsWithCounts);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      setError('Erro ao carregar locais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    try {
      if (!formData.name.trim()) {
        alert('Nome do local é obrigatório');
        return;
      }

      if (formData.name.length > 50) {
        alert('Nome do local deve ter no máximo 50 caracteres');
        return;
      }

      if (formData.description.length > 200) {
        alert('Descrição deve ter no máximo 200 caracteres');
        return;
      }

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar local');
      }

      const newLocation = await response.json();
      
      setLocations(prev => [...prev, { ...newLocation, productsCount: 0 }]);
      
      setFormData({ name: "", description: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar local:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar local. Tente novamente.');
    }
  };

  const handleEditLocation = async (location: Location) => {
    setEditingLocation(location);
    setEditFormData({
      name: location.name,
      description: location.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLocation) return;
    
    try {
      if (!editFormData.name.trim()) {
        alert('Nome do local é obrigatório');
        return;
      }

      if (editFormData.name.length > 50) {
        alert('Nome do local deve ter no máximo 50 caracteres');
        return;
      }

      if (editFormData.description.length > 200) {
        alert('Descrição deve ter no máximo 200 caracteres');
        return;
      }

      const response = await fetch(`/api/locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          description: editFormData.description.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar local');
      }

      const updatedLocation = await response.json();
      
      setLocations(prev => 
        prev.map(loc => 
          loc.id === editingLocation.id 
            ? { ...updatedLocation, productsCount: loc.productsCount }
            : loc
        )
      );
      
      setIsEditDialogOpen(false);
      setEditingLocation(null);
      setEditFormData({ name: "", description: "" });
    } catch (error) {
      console.error('Erro ao atualizar local:', error);
      alert(error instanceof Error ? error.message : 'Erro ao atualizar local');
    }
  };

  const handleDeleteLocation = async (location: Location) => {
    if (!confirm(`Tem certeza que deseja excluir o local "${location.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/locations/${location.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLocations(prev => prev.filter(loc => loc.id !== location.id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir local');
      }
    } catch (error) {
      console.error('Erro ao excluir local:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir local');
    }
  };

  const handleCancelCreate = () => {
    setFormData({ name: "", description: "" });
    setIsDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setEditFormData({ name: "", description: "" });
    setIsEditDialogOpen(false);
  };

  const getLocationStats = () => {
    const totalLocations = locations.length;
    const locationsInUse = locations.filter(loc => (loc.productsCount || 0) > 0).length;
    const emptyLocations = totalLocations - locationsInUse;
    
    return { totalLocations, locationsInUse, emptyLocations };
  };

  const stats = getLocationStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Locais de Armazenamento</h1>
            <p className="text-muted-foreground mt-1">Gerenciar locais onde os produtos são armazenados</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Novo Local
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando locais...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Locais de Armazenamento</h1>
            <p className="text-muted-foreground mt-1">Gerenciar locais onde os produtos são armazenados</p>
          </div>
          <Button onClick={fetchLocations}>
            Tentar Novamente
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-destructive">
            <p className="mb-4">{error}</p>
            <Button onClick={fetchLocations}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locais de Armazenamento</h1>
          <p className="text-muted-foreground mt-1">
            {stats.totalLocations === 0 
              ? "Nenhum local cadastrado" 
              : `${stats.totalLocations} local(is) cadastrado(s) • ${stats.locationsInUse} em uso • ${stats.emptyLocations} vazio(s)`
            }
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          data-testid="button-add-location"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Local
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum local cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Comece criando seu primeiro local de armazenamento para organizar seus produtos.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Local
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map(location => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={handleEditLocation}
              onDelete={handleDeleteLocation}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Local</DialogTitle>
            <DialogDescription>
              Adicione um novo local de armazenamento para organizar seus produtos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome do Local *
              </Label>
              <Input 
                id="name" 
                placeholder="Ex: Almoxarifado Principal, Estoque A, Loja Centro" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-location-name"
                maxLength={50}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.name.length}/50 caracteres
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descrição (Opcional)
              </Label>
              <Textarea 
                id="description" 
                placeholder="Descreva o local, tipo de produtos armazenados, localização física..."
                className="resize-none min-h-[80px]"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                data-testid="input-location-description"
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.description.length}/200 caracteres
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancelCreate}
                data-testid="button-cancel"
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateLocation} 
                data-testid="button-save"
                disabled={!formData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Local
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Local</DialogTitle>
            <DialogDescription>
              Modifique as informações do local de armazenamento.
              {editingLocation && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Local atual:</span> {editingLocation.name}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Nome do Local *
              </Label>
              <Input 
                id="edit-name" 
                placeholder="Ex: Almoxarifado Principal" 
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-edit-location-name"
                maxLength={50}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                {editFormData.name.length}/50 caracteres
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Descrição (Opcional)
              </Label>
              <Textarea 
                id="edit-description" 
                placeholder="Descreva o local e o que é armazenado" 
                className="resize-none min-h-[80px]"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                data-testid="input-edit-location-description"
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground text-right">
                {editFormData.description.length}/200 caracteres
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                data-testid="button-cancel-edit"
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                data-testid="button-save-edit"
                disabled={!editFormData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}