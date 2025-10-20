// components/ProductForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  locationId: z.string().min(1, "Local é obrigatório"),
  quantity: z.coerce.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  minQuantity: z.coerce.number().min(0, "Quantidade mínima deve ser maior ou igual a 0"),
  unitPrice: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Location {
  id: string;
  name: string;
  description?: string;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormValues) => void;
  onCancel?: () => void;
  defaultValues?: Partial<ProductFormValues>;
  categories: Category[];
  locations: Location[];
  isEditing?: boolean;
}

// Categorias pré-definidas para simplificar
const predefinedCategories = [
  { id: "limpeza", name: "Produtos de Limpeza", type: "limpeza" },
  { id: "ferramenta", name: "Ferramentas", type: "ferramenta" },
  { id: "insumo", name: "Insumos", type: "insumo" },
  { id: "equipamento", name: "Equipamentos", type: "equipamento" },
  { id: "material", name: "Materiais", type: "material" },
  { id: "outros", name: "Outros", type: "outros" },
];

export default function ProductForm({ 
  onSubmit, 
  onCancel,
  defaultValues,
  categories = predefinedCategories, // Usa as categorias pré-definidas por padrão
  locations,
  isEditing = false
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      name: "",
      code: "",
      categoryId: "",
      locationId: "",
      quantity: 0,
      minQuantity: 0,
      unitPrice: 0,
      description: "",
    },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      const dataToSubmit = {
        ...data,
        unitPrice: data.unitPrice.toString()
      };
      
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Erro no submit do formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAutoCode = () => {
    const baseCode = 'PROD';
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${baseCode}-${timestamp}${random}`;
  };

  const handleGenerateCode = () => {
    if (!isEditing && !form.getValues('code')) {
      form.setValue('code', generateAutoCode());
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite o nome do produto" 
                    {...field} 
                    data-testid="input-name" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="Ex: PROD-001" 
                      {...field} 
                      data-testid="input-code" 
                      readOnly={isEditing}
                    />
                  </FormControl>
                  {!isEditing && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGenerateCode}
                      className="whitespace-nowrap"
                    >
                      Gerar
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-location">
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.length > 0 ? (
                      locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-location" disabled>
                        Nenhum local disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade em Estoque *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    {...field} 
                    data-testid="input-quantity" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Mínimo *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    {...field} 
                    data-testid="input-min-quantity" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Unitário (R$) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="0.00"
                    {...field} 
                    data-testid="input-price" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite uma descrição detalhada do produto..." 
                  className="resize-none min-h-[100px]" 
                  {...field} 
                  data-testid="input-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Informações:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• A categoria define o tipo do produto (limpeza, ferramenta, insumo, etc.)</li>
            <li>• Campos marcados com * são obrigatórios</li>
            <li>• O código pode ser gerado automaticamente</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              data-testid="button-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            data-testid="button-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : isEditing ? (
              'Atualizar Produto'
            ) : (
              'Cadastrar Produto'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}