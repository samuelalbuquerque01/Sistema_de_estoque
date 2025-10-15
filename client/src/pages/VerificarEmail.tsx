// client/src/pages/VerificarEmail.tsx - CRIAR ESTE ARQUIVO
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, XCircle, Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerificarEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verificarEmail = async () => {
      // Extrair token da URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificação não encontrado na URL');
        return;
      }

      try {
        console.log('🔐 Verificando token:', token);
        
        const response = await fetch('/api/auth/verificar-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verificado com sucesso! Você já pode fazer login.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Erro ao verificar email');
        }
      } catch (error) {
        console.error('❌ Erro na verificação:', error);
        setStatus('error');
        setMessage('Erro de conexão. Tente novamente.');
      }
    };

    verificarEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {status === 'loading' && <Loader className="h-6 w-6 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
              {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
              Verificação de Email
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Verificando seu email...'}
              {status === 'success' && 'Email verificado com sucesso!'}
              {status === 'error' && 'Erro na verificação'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Mensagem */}
            <p className="text-lg text-gray-700">
              {message}
            </p>

            {/* Ações */}
            <div className="space-y-3">
              {status === 'success' && (
                <Button 
                  onClick={() => setLocation('/login')}
                  className="w-full"
                >
                  Fazer Login
                </Button>
              )}
              
              {status === 'error' && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => setLocation('/login')}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Login
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>

            {/* Informações Adicionais */}
            {status === 'error' && (
              <div className="text-sm text-gray-500 border-t pt-4">
                <p className="font-medium mb-2">Se o problema persistir:</p>
                <ul className="text-left space-y-1">
                  <li>• Verifique se o link está correto</li>
                  <li>• O token pode ter expirado (válido por 24h)</li>
                  <li>• Solicite um novo link de verificação no login</li>
                  <li>• Entre em contato com o suporte</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          StockMaster &copy; 2025
        </p>
      </div>
    </div>
  );
}