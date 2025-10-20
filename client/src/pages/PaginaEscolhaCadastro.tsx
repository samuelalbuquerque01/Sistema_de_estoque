// src/pages/PaginaEscolhaCadastro.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Building, User, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PaginaEscolhaCadastro() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<'empresa' | 'usuario' | null>(null);

  const options = [
    {
      id: 'empresa',
      title: 'Cadastrar Empresa',
      description: 'Ideal para empresas que desejam gerenciar múltiplos usuários e estoques',
      icon: Building,
      features: [
        'Múltiplos usuários administradores',
        'Gestão de departamentos',
        'Relatórios corporativos',
        'Backup em nuvem',
        'Suporte prioritário'
      ],
      recommended: true
    },
    {
      id: 'usuario',
      title: 'Cadastrar Usuário',
      description: 'Perfeito para usuários individuais ou pequenos negócios',
      icon: User,
      features: [
        'Gestão pessoal de estoque',
        'Relatórios básicos',
        'Até 3 locais de armazenamento',
        'Suporte por email',
        'Gratuito para sempre'
      ]
    }
  ];

  const handleContinue = () => {
    if (selectedType === 'empresa') {
      setLocation('/cadastro/empresa');
    } else if (selectedType === 'usuario') {
      setLocation('/cadastro/usuario');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Comece sua jornada no StockMaster
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o tipo de conta que melhor se adequa às suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {options.map((option) => (
            <Card 
              key={option.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedType === option.id 
                  ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedType(option.id as 'empresa' | 'usuario')}
            >
              {option.recommended && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                  Recomendado
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <option.icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">{option.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {option.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className={`text-center p-3 rounded-lg ${
                  selectedType === option.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {selectedType === option.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      Selecionado
                    </div>
                  ) : (
                    "Clique para selecionar"
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={!selectedType}
            className="px-8 py-3 text-lg"
          >
            Continuar para Cadastro
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-gray-500 mt-4">
            Já tem uma conta?{' '}
            <Button 
              variant="link" 
              className="p-0 text-blue-600"
              onClick={() => setLocation('/login')}
            >
              Faça login aqui
            </Button>
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Fácil Migração</h3>
            <p className="text-sm text-gray-600">Mude de plano a qualquer momento</p>
          </div>
          
          <div className="p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Teste Gratuito</h3>
            <p className="text-sm text-gray-600">30 dias grátis para empresas</p>
          </div>
          
          <div className="p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Suporte 24/7</h3>
            <p className="text-sm text-gray-600">Ajuda quando você precisar</p>
          </div>
        </div>
      </div>
    </div>
  );
}