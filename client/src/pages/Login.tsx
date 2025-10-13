// pages/Login.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Package, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/components/AuthContext"; // ← ADICIONE ESTA IMPORT

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // ← USE O HOOK DO AUTH

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (user) => {
      console.log('Login bem-sucedido:', user);
      login(user); // ← USE A FUNÇÃO LOGIN DO AUTH CONTEXT
      setLocation('/');
    },
    onError: (error: Error) => {
      console.error('Erro no login:', error);
      alert('Erro no login: ' + error.message);
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Por favor, preencha usuário e senha');
      return;
    }
    loginMutation.mutate({ username, password });
  };

  // Criar usuário admin automaticamente (apenas para desenvolvimento)
  const createAdminUser = async () => {
    try {
      await apiRequest('POST', '/api/auth/register', {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        email: 'admin@stockmaster.com'
      });
      console.log('Usuário admin criado com sucesso!');
    } catch (error) {
      console.log('Usuário admin já existe ou erro ao criar');
    }
  };

  // Executar na primeira vez
  useState(() => {
    createAdminUser();
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-xl bg-primary items-center justify-center mb-4">
            <Package className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">StockMaster</h1>
          <p className="text-muted-foreground mt-2">Sistema de Controle de Estoque</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    data-testid="input-username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-login"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar no Sistema"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Usuário: <strong>admin</strong></p>
                <p>Senha: <strong>admin123</strong></p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 StockMaster. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}