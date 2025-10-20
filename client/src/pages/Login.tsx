// client/src/pages/Login.tsx - VERSÃO CORRIGIDA (1 CLICK)
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'usuario-criado') {
      toast.success('Cadastro realizado!', {
        description: 'Verifique seu email para confirmar a conta.'
      });
    } else if (message === 'empresa-criada') {
      toast.success('Empresa cadastrada!', {
        description: 'Verifique seu email para confirmar a conta do administrador.'
      });
    } else if (message === 'email-verificado') {
      toast.success('Email verificado!', {
        description: 'Sua conta foi ativada com sucesso.'
      });
    }

    if (message) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro no login');
      }

      return data;
    },
    onSuccess: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(`Bem-vindo, ${user.name || 'Usuário'}!`, {
        description: 'Login realizado com sucesso.'
      });

      setTimeout(() => {
        setLocation('/');
      }, 100);
    },
    onError: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('não verificado') || errorMessage.includes('verificado')) {
        toast.error('Email não verificado', {
          description: 'Verifique seu email antes de fazer login.',
          action: {
            label: 'Reenviar verificação',
            onClick: () => handleResendVerification(email)
          },
        });
      } else if (errorMessage.includes('credenciais') || errorMessage.includes('incorretos')) {
        toast.error('Credenciais inválidas', {
          description: 'Verifique seu email e senha.'
        });
      } else {
        toast.error('Erro no login', {
          description: error.message || 'Tente novamente'
        });
      }
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Campos obrigatórios', {
        description: 'Preencha email e senha'
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Email inválido', {
        description: 'Digite um email válido'
      });
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
  };

  const handleResendVerification = async (emailToResend: string) => {
    if (!emailToResend) {
      toast.error('Email necessário', {
        description: 'Digite seu email para reenviar a verificação'
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/reenviar-verificacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToResend }),
      });

      if (response.ok) {
        toast.success('Email reenviado!', {
          description: 'Verifique sua caixa de entrada'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao reenviar email');
      }
    } catch (error) {
      toast.error('Erro ao reenviar', {
        description: error instanceof Error ? error.message : 'Tente novamente'
      });
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 rounded-2xl bg-white items-center justify-center mb-4 shadow-lg border border-green-200">
            <img 
              src="https://www.neuropsicocentro.com.br/img/logo.png" 
              alt="Neuropsicocentro" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Neuropsicocentro</h1>
          <p className="text-gray-600 text-lg">Controle Inteligente de Estoque</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-900">Acessar Sistema</CardTitle>
            <CardDescription className="text-gray-600">
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent h-12"
                    disabled={loginMutation.isPending}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-900">Senha</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="text-green-600 hover:text-green-700 p-0 h-auto text-sm"
                    onClick={() => {}}
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 py-3 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent h-12"
                    disabled={loginMutation.isPending}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-lg transition-all duration-200 h-12"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  'Entrar no Sistema'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500">
                    Novo por aqui?
                  </span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline" 
                className="w-full py-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold h-12"
                onClick={() => setLocation('/cadastro')}
                disabled={loginMutation.isPending}
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                Criar Nova Conta
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-600 text-sm mt-6">
          © 2025 Sistema de Estoque. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}