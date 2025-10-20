// client/src/pages/Relatorios.tsx - VERSÃO FINAL (APENAS PDF NO FRONT)
import { FileText, Download, TrendingDown, DollarSign, ClipboardList, MapPin, Calendar, BarChart3, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onGenerate: (period?: string) => void;
  showPeriodFilter?: boolean;
}

function ReportCard({ title, description, icon, onGenerate, showPeriodFilter = false }: ReportCardProps) {
  const [period, setPeriod] = useState("30");

  const handleGenerate = () => {
    if (showPeriodFilter) {
      onGenerate(period);
    } else {
      onGenerate();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col justify-end">
        <div className="space-y-2">
          {showPeriodFilter && (
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleGenerate}
        >
          <Download className="h-4 w-4 mr-2" />
          Gerar Relatório PDF
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Relatorios() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/reports/stats'],
  });

  const handleGenerate = async (reportName: string, period?: string) => {
    setIsGenerating(reportName);
    
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: reportName,
          format: 'pdf',
          period: period || 'all'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `relatorio_${reportName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Relatório "${reportName}" gerado com sucesso!`, {
          description: 'Documento PDF pronto para download'
        });

        refetchStats();
        
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao gerar relatório');
      }
    } catch (error) {
      toast.error(`Erro ao gerar relatório: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    } finally {
      setIsGenerating(null);
    }
  };

  const reportCards = [
    {
      title: "Relatório de Produtos",
      description: "Lista completa de todos os produtos cadastrados com informações detalhadas",
      icon: <Package className="h-6 w-6 text-blue-600" />,
      onGenerate: (period?: string) => handleGenerate('Produtos', period),
    },
    {
      title: "Estoque Baixo",
      description: "Produtos que atingiram ou estão abaixo do estoque mínimo definido",
      icon: <TrendingDown className="h-6 w-6 text-red-600" />,
      onGenerate: (period?: string) => handleGenerate('Estoque Baixo', period),
    },
    {
      title: "Valor do Estoque",
      description: "Análise financeira com valor total do estoque por categorias",
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      onGenerate: (period?: string) => handleGenerate('Valor Estoque', period),
    },
    {
      title: "Movimentações",
      description: "Histórico completo de entradas, saídas e ajustes de estoque",
      icon: <ClipboardList className="h-6 w-6 text-purple-600" />,
      onGenerate: (period?: string) => handleGenerate('Movimentações', period),
      showPeriodFilter: true,
    },
    {
      title: "Inventários",
      description: "Relatório de inventários realizados com análise de divergências",
      icon: <Calendar className="h-6 w-6 text-orange-600" />,
      onGenerate: (period?: string) => handleGenerate('Inventários', period),
      showPeriodFilter: true,
    },
    {
      title: "Produtos por Local",
      description: "Distribuição espacial dos produtos por local de armazenamento",
      icon: <MapPin className="h-6 w-6 text-indigo-600" />,
      onGenerate: (period?: string) => handleGenerate('Produtos por Local', period),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Gerar relatórios detalhados em formato PDF
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Relatórios</p>
                <p className="text-2xl font-bold">{stats?.totalReports || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipos de Relatório</p>
                <p className="text-2xl font-bold">{Object.keys(stats?.reportsByType || {}).length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Geração</p>
                <p className="text-sm font-medium">
                  {stats?.lastGenerated ? new Date(stats.lastGenerated).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card, index) => (
          <ReportCard
            key={index}
            title={card.title}
            description={card.description}
            icon={card.icon}
            onGenerate={card.onGenerate}
            showPeriodFilter={card.showPeriodFilter}
          />
        ))}
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg border flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p>Gerando {isGenerating}...</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Sobre os Relatórios PDF</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Documentos seguros e não editáveis</li>
            <li>• Layout profissional para impressão</li>
            <li>• Dados organizados e formatados</li>
            <li>• Compatível com todos os dispositivos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}