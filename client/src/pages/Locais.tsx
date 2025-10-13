// Locais.tsx - VERSÃO COM API REAL
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationCard from "@/components/LocationCard";
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

interface Location {
  id: string;
  name: string;
  description?: string;
  productsCount?: number;
}

export default function Locais() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  // Carregar locais da API
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
      
      // Buscar contagem de produtos para cada local
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

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar local');
      }

      const newLocation = await response.json();
      
      // Atualizar a lista de locais
      setLocations(prev => [...prev, { ...newLocation, productsCount: 0 }]);
      
      // Limpar formulário e fechar dialog
      setFormData({ name: "", description: "" });
      setIsDialogOpen(false);
      
      console.log('Local criado com sucesso:', newLocation);
    } catch (error) {
      console.error('Erro ao criar local:', error);
      alert('Erro ao criar local. Tente novamente.');
    }
  };

  const handleEditLocation = async (location: Location) => {
    console.log('Editar local:', location);
    // Implementar lógica de edição aqui
  };

  const handleDeleteLocation = async (location: Location) => {
    if (confirm(`Tem certeza que deseja excluir o local "${location.name}"?`)) {
      try {
        const response = await fetch(`/api/locations/${location.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setLocations(prev => prev.filter(loc => loc.id !== location.id));
          console.log('Local excluído:', location);
        } else {
          throw new Error('Erro ao excluir local');
        }
      } catch (error) {
        console.error('Erro ao excluir local:', error);
        alert('Erro ao excluir local');
      }
    }
  };

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
          <p>Carregando locais...</p>
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
          <h1 className="text-3xl font-bold">Locais de Armazenamento</h1>
          <p className="text-muted-foreground mt-1">Gerenciar locais onde os produtos são armazenados</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-location">
          <Plus className="h-4 w-4 mr-2" />
          Novo Local
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum local cadastrado</p>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Primeiro Local
          </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Local</DialogTitle>
            <DialogDescription>
              Adicione um novo local de armazenamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Local</Label>
              <Input 
                id="name" 
                placeholder="Ex: Almoxarifado Principal" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-location-name" 
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea 
                id="description" 
                placeholder="Descreva o local e o que é armazenado" 
                className="resize-none"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                data-testid="input-location-description"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setFormData({ name: "", description: "" });
                }} 
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateLocation} 
                data-testid="button-save"
                disabled={!formData.name.trim()}
              >
                Salvar Local
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}