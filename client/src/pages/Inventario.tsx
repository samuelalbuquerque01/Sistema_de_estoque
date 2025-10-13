// pages/Inventario.tsx - VERSÃO SEGURA PARA PRODUÇÃO
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InventoryList from "@/components/InventoryList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Inventory } from "@shared/schema";
import { useAuth } from "@/components/AuthContext";
import { useLocation } from "wouter";

export default function Inventario() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inventoryName, setInventoryName] = useState("");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Buscar inventários da API
  const { data: inventories = [], isLoading, refetch, error } = useQuery<Inventory[]>({
    queryKey: ['/api/inventories'],
  });

  // Mutação para criar novo inventário
  const createInventoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/inventories', {
        name,
        userId: user?.id
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setInventoryName("");
    },
    onError: (error) => {
      alert('Erro ao criar inventário: ' + error.message);
    }
  });

  // Mutação para finalizar inventário
  const finalizeInventoryMutation = useMutation({
    mutationFn: async (inventoryId: string) => {
      const response = await apiRequest('PUT', `/api/inventories/${inventoryId}/finalize`);
      return response.json();
    },
    onSuccess: () => {
      refetch();
      alert('Inventário finalizado com sucesso!');
    },
    onError: (error) => {
      alert('Erro ao finalizar inventário: ' + error.message);
    }
  });

  const handleCreateInventory = () => {
    if (!inventoryName.trim()) {
      alert('Por favor, digite um nome para o inventário');
      return;
    }
    
    if (!user) {
      alert('Usuário não está logado');
      return;
    }
    
    createInventoryMutation.mutate(inventoryName.trim());
  };

  // ✅ FUNÇÃO PARA VISUALIZAR INVENTÁRIO
  const handleViewInventory = (inventory: Inventory) => {
    window.location.href = `/inventario/${inventory.id}`;
  };

  // ✅ FUNÇÃO PARA FINALIZAR INVENTÁRIO
  const handleFinalizeInventory = (inventory: Inventory) => {
    if (inventory.status === 'finalizado') {
      alert('Este inventário já está finalizado!');
      return;
    }

    if (confirm(`Tem certeza que deseja finalizar o inventário "${inventory.name}"?\n\nApós finalizar, não será possível alterar as contagens.`)) {
      finalizeInventoryMutation.mutate(inventory.id);
    }
  };

  // Converter dados da API para o formato esperado pelo InventoryList
  const formattedInventories = inventories.map(inv => ({
    id: inv.id,
    name: inv.name,
    status: inv.status as 'em_andamento' | 'finalizado',
    user: user?.name || 'Administrador',
    createdAt: new Date(inv.createdAt),
    finishedAt: inv.finishedAt ? new Date(inv.finishedAt) : undefined,
    itemsCount: 0 // Pode ser calculado depois com contagens reais
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventário</h1>
          <p className="text-muted-foreground mt-1">Controle de contagem e inventário de estoque</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          data-testid="button-new-inventory"
          disabled={createInventoryMutation.isPending || !user}
        >
          <Plus className="h-4 w-4 mr-2" />
          {createInventoryMutation.isPending ? "Criando..." : "Novo Inventário"}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          Erro ao carregar inventários: {error.message}
        </div>
      )}

      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Você precisa estar logado para criar inventários.
        </div>
      )}

      {/* ✅ INVENTORYLIST COM AS FUNÇÕES CONFIGURADAS */}
      <InventoryList
        inventories={formattedInventories}
        onView={handleViewInventory}
        onFinalize={handleFinalizeInventory}
        isLoading={isLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Inventário</DialogTitle>
            <DialogDescription>
              Crie um novo inventário para realizar a contagem de estoque.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inventory-name">Nome do Inventário</Label>
              <Input 
                id="inventory-name" 
                placeholder="Ex: Inventário Mensal - Fevereiro 2025" 
                data-testid="input-inventory-name"
                value={inventoryName}
                onChange={(e) => setInventoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateInventory();
                  }
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setInventoryName("");
                }} 
                data-testid="button-cancel"
                disabled={createInventoryMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateInventory}
                data-testid="button-create"
                disabled={!inventoryName.trim() || createInventoryMutation.isPending || !user}
              >
                {createInventoryMutation.isPending ? "Criando..." : "Criar Inventário"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}