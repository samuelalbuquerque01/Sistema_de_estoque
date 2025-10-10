import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationCard from "@/components/LocationCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Locais() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //todo: remove mock functionality
  const mockLocations = [
    { id: '1', name: 'Almoxarifado A', description: 'Depósito principal de materiais e equipamentos', productsCount: 245 },
    { id: '2', name: 'Depósito B', description: 'Área de insumos e produtos químicos', productsCount: 89 },
    { id: '3', name: 'Oficina', description: 'Ferramentas e equipamentos de manutenção', productsCount: 156 },
    { id: '4', name: 'Depósito C', description: 'Produtos de limpeza e higiene', productsCount: 78 },
    { id: '5', name: 'Sala de Equipamentos TI', productsCount: 42 },
  ];

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockLocations.map(location => (
          <LocationCard
            key={location.id}
            location={location}
            onEdit={(loc) => console.log('Editar:', loc)}
            onDelete={(loc) => console.log('Excluir:', loc)}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Local</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Local</Label>
              <Input id="name" placeholder="Ex: Almoxarifado Principal" data-testid="input-location-name" />
            </div>
            <div>
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea 
                id="description" 
                placeholder="Descreva o local e o que é armazenado" 
                className="resize-none"
                data-testid="input-location-description"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                Cancelar
              </Button>
              <Button onClick={() => {
                console.log('Local criado');
                setIsDialogOpen(false);
              }} data-testid="button-save">
                Salvar Local
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
