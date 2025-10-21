// src/pages/CadastroEmpresa.tsx - VERSÃO LIMPA E SEGURA
import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, ArrowLeft, Mail, Lock, User, MapPin, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Schema de validação
const empresaSchema = z.object({
  // Dados da Empresa
  empresaNome: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres"),
  empresaCnpj: z.string().min(14, "CNPJ deve ter 14 caracteres").max(18),
  empresaEmail: z.string().email("Email da empresa inválido"),
  empresaTelefone: z.string().min(10, "Telefone inválido"),
  empresaWebsite: z.string().optional(),
  
  // Endereço
  empresaCep: z.string().min(8, "CEP inválido"),
  empresaLogradouro: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  empresaNumero: z.string().min(1, "Número é obrigatório"),
  empresaComplemento: z.string().optional(),
  empresaCidade: z.string().min(2, "Cidade é obrigatória"),
  empresaEstado: z.string().length(2, "Estado deve ter 2 caracteres"),
  
  // Dados do Administrador
  adminNome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  adminEmail: z.string().email("Email inválido"),
  adminTelefone: z.string().min(10, "Telefone inválido"),
  adminSenha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  adminConfirmarSenha: z.string(),
  
  // Termos
  aceitarTermos: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
}).refine((data) => data.adminSenha === data.adminConfirmarSenha, {
  message: "Senhas não conferem",
  path: ["adminConfirmarSenha"],
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

export default function CadastroEmpresa() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      aceitarTermos: false
    }
  });

  const handleAceitarTermosChange = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setValue("aceitarTermos", isChecked, { shouldValidate: true });
  };

  const onSubmit = async (data: EmpresaFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/cadastro/empresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Dados da empresa
          empresaNome: data.empresaNome,
          empresaCnpj: data.empresaCnpj,
          empresaEmail: data.empresaEmail,
          empresaTelefone: data.empresaTelefone,
          empresaWebsite: data.empresaWebsite,
          empresaCep: data.empresaCep,
          empresaLogradouro: data.empresaLogradouro,
          empresaNumero: data.empresaNumero,
          empresaComplemento: data.empresaComplemento,
          empresaCidade: data.empresaCidade,
          empresaEstado: data.empresaEstado,
          
          // Dados do admin
          adminNome: data.adminNome,
          adminEmail: data.adminEmail,
          adminSenha: data.adminSenha,
        }),
      });

      if (response.ok) {
        toast.success('Cadastro realizado com sucesso!', {
          description: 'Enviamos um email de confirmação para validar sua conta.'
        });
        setLocation('/login?message=empresa-criada');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar empresa');
      }
    } catch (error) {
      toast.error('Erro no cadastro', {
        description: error instanceof Error ? error.message : 'Tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setValue("empresaLogradouro", data.logradouro);
          setValue("empresaCidade", data.localidade);
          setValue("empresaEstado", data.uf);
          trigger(["empresaLogradouro", "empresaCidade", "empresaEstado"]);
        }
      } catch (error) {
        // Erro silencioso - não mostra para o usuário
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/cadastro')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Escolha
          </Button>
          
          <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Building className="h-10 w-10 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Empresa
          </h1>
          <p className="text-gray-600">
            Preencha os dados da sua empresa e do administrador
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Seção 1: Dados da Empresa */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Dados da Empresa
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresaNome">Nome da Empresa *</Label>
                    <Input
                      id="empresaNome"
                      placeholder="Nome fantasia ou razão social"
                      {...register('empresaNome')}
                      className="h-11"
                    />
                    {errors.empresaNome && (
                      <p className="text-sm text-red-600">{errors.empresaNome.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaCnpj">CNPJ *</Label>
                    <Input
                      id="empresaCnpj"
                      placeholder="00.000.000/0001-00"
                      {...register('empresaCnpj')}
                      className="h-11"
                    />
                    {errors.empresaCnpj && (
                      <p className="text-sm text-red-600">{errors.empresaCnpj.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaEmail">Email Corporativo *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="empresaEmail"
                        type="email"
                        placeholder="empresa@exemplo.com"
                        className="pl-10 h-11"
                        {...register('empresaEmail')}
                      />
                    </div>
                    {errors.empresaEmail && (
                      <p className="text-sm text-red-600">{errors.empresaEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaTelefone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="empresaTelefone"
                        placeholder="(11) 99999-9999"
                        className="pl-10 h-11"
                        {...register('empresaTelefone')}
                      />
                    </div>
                    {errors.empresaTelefone && (
                      <p className="text-sm text-red-600">{errors.empresaTelefone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="empresaWebsite">Website (Opcional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="empresaWebsite"
                        placeholder="https://www.suaempresa.com.br"
                        className="pl-10 h-11"
                        {...register('empresaWebsite')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Endereço */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Endereço da Empresa
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresaCep">CEP *</Label>
                    <Input
                      id="empresaCep"
                      placeholder="00000-000"
                      {...register('empresaCep')}
                      className="h-11"
                      onBlur={(e) => buscarCEP(e.target.value)}
                    />
                    {errors.empresaCep && (
                      <p className="text-sm text-red-600">{errors.empresaCep.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaNumero">Número *</Label>
                    <Input
                      id="empresaNumero"
                      placeholder="123"
                      {...register('empresaNumero')}
                      className="h-11"
                    />
                    {errors.empresaNumero && (
                      <p className="text-sm text-red-600">{errors.empresaNumero.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="empresaLogradouro">Logradouro *</Label>
                    <Input
                      id="empresaLogradouro"
                      placeholder="Rua, Avenida, etc."
                      {...register('empresaLogradouro')}
                      className="h-11"
                    />
                    {errors.empresaLogradouro && (
                      <p className="text-sm text-red-600">{errors.empresaLogradouro.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaComplemento">Complemento (Opcional)</Label>
                    <Input
                      id="empresaComplemento"
                      placeholder="Sala, Andar, etc."
                      {...register('empresaComplemento')}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaCidade">Cidade *</Label>
                    <Input
                      id="empresaCidade"
                      placeholder="São Paulo"
                      {...register('empresaCidade')}
                      className="h-11"
                    />
                    {errors.empresaCidade && (
                      <p className="text-sm text-red-600">{errors.empresaCidade.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaEstado">Estado *</Label>
                    <Input
                      id="empresaEstado"
                      placeholder="SP"
                      maxLength={2}
                      {...register('empresaEstado')}
                      className="h-11"
                    />
                    {errors.empresaEstado && (
                      <p className="text-sm text-red-600">{errors.empresaEstado.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 3: Administrador */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-purple-600" />
                  Dados do Administrador
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminNome">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminNome"
                        placeholder="Seu nome completo"
                        className="pl-10 h-11"
                        {...register('adminNome')}
                      />
                    </div>
                    {errors.adminNome && (
                      <p className="text-sm text-red-600">{errors.adminNome.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10 h-11"
                        {...register('adminEmail')}
                      />
                    </div>
                    {errors.adminEmail && (
                      <p className="text-sm text-red-600">{errors.adminEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminTelefone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminTelefone"
                        placeholder="(11) 99999-9999"
                        className="pl-10 h-11"
                        {...register('adminTelefone')}
                      />
                    </div>
                    {errors.adminTelefone && (
                      <p className="text-sm text-red-600">{errors.adminTelefone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminSenha">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminSenha"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className="pl-10 h-11"
                        {...register('adminSenha')}
                      />
                    </div>
                    {errors.adminSenha && (
                      <p className="text-sm text-red-600">{errors.adminSenha.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminConfirmarSenha">Confirmar Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminConfirmarSenha"
                        type="password"
                        placeholder="Digite novamente sua senha"
                        className="pl-10 h-11"
                        {...register('adminConfirmarSenha')}
                      />
                    </div>
                    {errors.adminConfirmarSenha && (
                      <p className="text-sm text-red-600">{errors.adminConfirmarSenha.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Termos e Condições */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="aceitarTermos" 
                    checked={watch("aceitarTermos")}
                    onCheckedChange={handleAceitarTermosChange}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="aceitarTermos" className="text-sm leading-relaxed cursor-pointer font-medium text-blue-900">
                      Aceito os Termos de Serviço e Política de Privacidade
                    </Label>
                    <p className="text-xs text-blue-700">
                      Ao marcar esta opção, você concorda com nossos termos e políticas de uso do sistema.
                    </p>
                  </div>
                </div>
                {errors.aceitarTermos && (
                  <p className="text-sm text-red-600 font-medium">{errors.aceitarTermos.message}</p>
                )}
              </div>

              {/* Botão de Submit */}
              <Button 
                type="submit" 
                className="w-full py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 font-semibold" 
                disabled={isLoading || !watch("aceitarTermos")}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando Conta...
                  </>
                ) : (
                  <>
                    <Building className="h-5 w-5 mr-2" />
                    Criar Conta da Empresa
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Ao criar uma conta, você concorda com nossos termos e políticas.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="link" 
            className="text-blue-600"
            onClick={() => setLocation('/login')}
          >
            Já tem uma conta? Faça login aqui
          </Button>
        </div>
      </div>
    </div>
  );
}