import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InventoryList from "@/components/InventoryList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Inventario() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //todo: remove mock functionality
  const mockInventories = [
    { id: '1', name: 'Inventário Mensal - Janeiro 2025', status: 'em_andamento' as const, user: 'João Silva', createdAt: new Date(2025, 0, 10), itemsCount: 45 },
    { id: '2', name: 'Inventário Semestral 2024', status: 'finalizado' as const, user: 'Maria Santos', createdAt: new Date(2024, 11, 20), finishedAt: new Date(2024, 11, 22), itemsCount: 523 },
    { id: '3', name: 'Contagem Rápida - Ferramentas', status: 'em_andamento' as const, user: 'Pedro Costa', createdAt: new Date(2025, 0, 8), itemsCount: 12 },
    { id: '4', name: 'Inventário Anual 2024', status: 'finalizado' as const, user: 'Ana Paula', createdAt: new Date(2024, 11, 1), finishedAt: new Date(2024, 11, 15), itemsCount: 1247 },
    { id: '5', name: 'Inventário Trimestral Q4', status: 'finalizado' as const, user: 'Carlos Lima', createdAt: new Date(2024, 9, 1), finishedAt: new Date(2024, 9, 5), itemsCount: 892 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventário</h1>
          <p className="text-muted-foreground mt-1">Controle de contagem e inventário de estoque</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-new-inventory">
          <Plus className="h-4 w-4 mr-2" />
          Novo Inventário
        </Button>
      </div>

      <InventoryList
        inventories={mockInventories}
        onView={(inv) => console.log('Visualizar:', inv)}
        onFinalize={(inv) => console.log('Finalizar:', inv)}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Inventário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inventory-name">Nome do Inventário</Label>
              <Input 
                id="inventory-name" 
                placeholder="Ex: Inventário Mensal - Fevereiro 2025" 
                data-testid="input-inventory-name"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                Cancelar
              </Button>
              <Button onClick={() => {
                console.log('Inventário criado');
                setIsDialogOpen(false);
              }} data-testid="button-create">
                Criar Inventário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
