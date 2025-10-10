import { FileText, Download, TrendingDown, DollarSign, ClipboardList } from "lucide-react";
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

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onGenerate: (format: string) => void;
}

function ReportCard({ title, description, icon, onGenerate }: ReportCardProps) {
  const [format, setFormat] = useState("pdf");

  return (
    <Card>
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
      <CardContent className="space-y-3">
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger data-testid={`select-format-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            <SelectValue placeholder="Formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          className="w-full" 
          onClick={() => onGenerate(format)}
          data-testid={`button-generate-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Download className="h-4 w-4 mr-2" />
          Gerar Relatório
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Relatorios() {
  const handleGenerate = (reportName: string, format: string) => {
    console.log(`Gerando relatório: ${reportName} - Formato: ${format}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Gerar relatórios e exportar dados do sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ReportCard
          title="Relatório de Produtos"
          description="Lista completa de todos os produtos cadastrados com suas informações"
          icon={<FileText className="h-6 w-6 text-primary" />}
          onGenerate={(format) => handleGenerate('Produtos', format)}
        />

        <ReportCard
          title="Estoque Baixo"
          description="Produtos que atingiram ou estão abaixo da quantidade mínima"
          icon={<TrendingDown className="h-6 w-6 text-primary" />}
          onGenerate={(format) => handleGenerate('Estoque Baixo', format)}
        />

        <ReportCard
          title="Valor do Estoque"
          description="Relatório financeiro com valor total do estoque por categoria"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          onGenerate={(format) => handleGenerate('Valor Estoque', format)}
        />

        <ReportCard
          title="Movimentações"
          description="Histórico detalhado de entradas, saídas e ajustes de estoque"
          icon={<ClipboardList className="h-6 w-6 text-primary" />}
          onGenerate={(format) => handleGenerate('Movimentações', format)}
        />

        <ReportCard
          title="Inventários"
          description="Resumo de todos os inventários realizados e suas divergências"
          icon={<ClipboardList className="h-6 w-6 text-primary" />}
          onGenerate={(format) => handleGenerate('Inventários', format)}
        />

        <ReportCard
          title="Produtos por Local"
          description="Distribuição de produtos por local de armazenamento"
          icon={<FileText className="h-6 w-6 text-primary" />}
          onGenerate={(format) => handleGenerate('Produtos por Local', format)}
        />
      </div>
    </div>
  );
}
