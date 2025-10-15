// src/pages/GerenciarUsuarios.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User, Shield, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  emailVerificado: boolean;
  createdAt: string;
}

export default function GerenciarUsuarios() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
    password: ''
  });

  // 🔥 Verificar permissões
  const canManageUsers = user?.role === 'super_admin' || user?.role === 'admin';

  useEffect(() => {
    if (!canManageUsers) {
      toast.error('Acesso negado', {
        description: 'Você não tem permissão para gerenciar usuários'
      });
      setLocation('/');
      return;
    }
    carregarUsuarios();
  }, [user]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuarios');
      
      if (!response.ok) throw new Error('Erro ao carregar usuários');
      
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const criarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar usuário');
      }

      toast.success('Usuário criado com sucesso!');
      setFormData({ name: '', email: '', role: 'user', password: '' });
      setShowForm(false);
      carregarUsuarios();
    } catch (error) {
      toast.error('Erro ao criar usuário', {
        description: error instanceof Error ? error.message : 'Tente novamente'
      });
    }
  };

  const atualizarRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/usuarios/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Erro ao atualizar permissão');

      toast.success('Permissão atualizada com sucesso!');
      carregarUsuarios();
    } catch (error) {
      toast.error('Erro ao atualizar permissão');
    }
  };

  const deletarUsuario = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao deletar usuário');

      toast.success('Usuário deletado com sucesso!');
      carregarUsuarios();
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    }
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      'super_admin': { label: 'Super Admin', variant: 'destructive' as const, icon: Shield },
      'admin': { label: 'Admin', variant: 'default' as const, icon: UserCheck },
      'user': { label: 'Usuário', variant: 'secondary' as const, icon: User }
    };
    
    const roleInfo = roles[role as keyof typeof roles];
    const IconComponent = roleInfo.icon;
    
    return (
      <Badge variant={roleInfo.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {roleInfo.label}
      </Badge>
    );
  };

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Acesso Negado</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Você não tem permissão para acessar esta página.
              </p>
              <Button onClick={() => setLocation('/')} className="mt-4">
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários e permissões do sistema
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Formulário de Novo Usuário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Usuário</CardTitle>
            <CardDescription>
              Preencha os dados do novo usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={criarUsuario} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do usuário"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@empresa.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Permissão</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha Temporária</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Senha temporária"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Criar Usuário</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            {usuarios.length} usuário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{usuario.name}</div>
                        <div className="text-sm text-muted-foreground">{usuario.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(usuario.role)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.emailVerificado ? "default" : "secondary"}>
                        {usuario.emailVerificado ? "Verificado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Não permitir editar super_admin (exceto se for o próprio usuário) */}
                        {(usuario.role !== 'super_admin' || usuario.id === user?.id) && (
                          <Select
                            value={usuario.role}
                            onValueChange={(newRole) => atualizarRole(usuario.id, newRole)}
                            disabled={usuario.id === user?.id} // Não pode mudar a própria role
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuário</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              {user?.role === 'super_admin' && (
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {/* Não permitir deletar próprio usuário ou super_admin */}
                        {usuario.id !== user?.id && usuario.role !== 'super_admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletarUsuario(usuario.id, usuario.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}