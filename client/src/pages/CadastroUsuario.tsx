// src/pages/CadastroUsuario.tsx - VERSÃO LIMPA E SEGURA
import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, ArrowLeft, Mail, Lock, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Schema de validação
const usuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
  aceitarTermos: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
  receberNewsletter: z.boolean().default(false),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não conferem",
  path: ["confirmarSenha"],
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

export default function CadastroUsuario() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      aceitarTermos: false,
      receberNewsletter: false
    }
  });

  const handleAceitarTermosChange = (checked: boolean) => {
    setValue("aceitarTermos", checked, { shouldValidate: true });
  };

  const handleNewsletterChange = (checked: boolean) => {
    setValue("receberNewsletter", checked, { shouldValidate: true });
  };

  const onSubmit = async (data: UsuarioFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/cadastro/usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Cadastro realizado com sucesso!', {
          description: 'Enviamos um email de confirmação para validar sua conta.'
        });
        setLocation('/login?message=usuario-criado');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      toast.error('Erro no cadastro', {
        description: error instanceof Error ? error.message : 'Tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/cadastro')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Usuário
          </h1>
          <p className="text-gray-600">
            Crie sua conta pessoal em poucos minutos
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="nome"
                      placeholder="Seu nome completo"
                      className="pl-10 h-11"
                      {...register('nome')}
                    />
                  </div>
                  {errors.nome && (
                    <p className="text-sm text-red-600">{errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-9999"
                      className="pl-10 h-11"
                      {...register('telefone')}
                    />
                  </div>
                  {errors.telefone && (
                    <p className="text-sm text-red-600">{errors.telefone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 h-11"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="senha"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10 h-11"
                      {...register('senha')}
                    />
                  </div>
                  {errors.senha && (
                    <p className="text-sm text-red-600">{errors.senha.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmarSenha"
                      type="password"
                      placeholder="Digite novamente sua senha"
                      className="pl-10 h-11"
                      {...register('confirmarSenha')}
                    />
                  </div>
                  {errors.confirmarSenha && (
                    <p className="text-sm text-red-600">{errors.confirmarSenha.message}</p>
                  )}
                </div>
              </div>

              {/* Benefícios */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">
                  🎁 Conta Gratuita Inclui:
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li className="flex items-center">
                    <Check className="h-3 w-3 mr-2" />
                    Até 100 produtos no estoque
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 mr-2" />
                    3 locais de armazenamento
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 mr-2" />
                    Relatórios básicos em PDF
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 mr-2" />
                    Suporte por email
                  </li>
                </ul>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="aceitarTermos" 
                    checked={watch("aceitarTermos")}
                    onCheckedChange={handleAceitarTermosChange}
                  />
                  <Label htmlFor="aceitarTermos" className="text-sm leading-relaxed cursor-pointer">
                    Concordo com os{' '}
                    <Button 
                      type="button"
                      variant="link" 
                      className="p-0 h-auto text-blue-600"
                      onClick={() => window.open('/termos', '_blank')}
                    >
                      Termos de Serviço
                    </Button>{' '}
                    e{' '}
                    <Button 
                      type="button"
                      variant="link" 
                      className="p-0 h-auto text-blue-600"
                      onClick={() => window.open('/privacidade', '_blank')}
                    >
                      Política de Privacidade
                    </Button>
                  </Label>
                </div>
                {errors.aceitarTermos && (
                  <p className="text-sm text-red-600">{errors.aceitarTermos.message}</p>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="receberNewsletter" 
                    checked={watch("receberNewsletter")}
                    onCheckedChange={handleNewsletterChange}
                  />
                  <Label htmlFor="receberNewsletter" className="text-sm leading-relaxed cursor-pointer">
                    Desejo receber novidades e dicas sobre gestão de estoque
                  </Label>
                </div>
              </div>

              {/* Botão de Submit */}
              <Button 
                type="submit" 
                className="w-full py-3 text-lg bg-green-600 hover:bg-green-700 h-12 font-semibold" 
                disabled={isLoading || !watch("aceitarTermos")}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando Conta...
                  </>
                ) : (
                  'Criar Minha Conta Gratuita'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          Já tem uma conta?{' '}
          <Button 
            variant="link" 
            className="p-0 text-green-600"
            onClick={() => setLocation('/login')}
          >
            Faça login aqui
          </Button>
        </p>
      </div>
    </div>
  );
}