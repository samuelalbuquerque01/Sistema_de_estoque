// client/src/pages/Login.tsx - VERSÃO CORRIGIDA E PROFISSIONAL
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Package, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se há mensagens na URL
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no login');
      }

      return response.json();
    },
    onSuccess: (user) => {
      console.log('✅ Login bem-sucedido:', user);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Login realizado!', {
        description: `Bem-vindo, ${user.name}!`
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      console.error('❌ Erro no login:', error);
      
      if (error.message.includes('Email não verificado')) {
        toast.error('Email não verificado', {
          description: 'Verifique seu email antes de fazer login.',
          action: {
            label: 'Reenviar verificação',
            onClick: () => handleResendVerification()
          },
        });
      } else {
        toast.error('Erro no login', {
          description: error.message
        });
      }
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
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

    loginMutation.mutate({ email, password });
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email necessário', {
        description: 'Digite seu email para reenviar a verificação'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reenviar-verificacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
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
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header Moderno */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 items-center justify-center mb-4 shadow-lg">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">StockMaster</h1>
          <p className="text-slate-300 text-lg">Controle Inteligente de Estoque</p>
        </div>

        <Card className="bg-slate-800 border-slate-700 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-white">Acessar Sistema</CardTitle>
            <CardDescription className="text-slate-400">
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Campo Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-white">Senha</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm"
                    onClick={() => {/* Implementar recuperação de senha */}}
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 py-3 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loginMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Botão Login */}
              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg transition-all duration-200"
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

              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-3 text-slate-400">
                    Novo por aqui?
                  </span>
                </div>
              </div>

              {/* Botão Cadastro */}
              <Button 
                type="button"
                variant="outline" 
                className="w-full py-3 border-slate-600 text-white hover:bg-slate-700 hover:text-white font-semibold"
                onClick={() => setLocation('/cadastro')}
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                Criar Nova Conta
              </Button>
            </form>

            {/* Credenciais de Teste */}
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <p className="text-slate-300 text-sm font-medium text-center mb-2">Credenciais de Teste</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">Email:</div>
                <div className="text-white font-mono">admin@stockmaster.com</div>
                <div className="text-slate-400">Senha:</div>
                <div className="text-white font-mono">admin123</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <p className="text-center text-slate-400 text-sm mt-6">
          © 2025 StockMaster. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}