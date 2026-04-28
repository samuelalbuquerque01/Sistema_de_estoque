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
  code: z.string().min(1, "Número do patrimônio é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  locationId: z.string().min(1, "Local é obrigatório"),
  quantity: z.coerce.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  minQuantity: z.coerce.number().min(0, "Quantidade mínima deve ser maior ou igual a 0"),
  unitPrice: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
  description: z.string().optional(),
});

type InventoryItemType =
  | "produto"
  | "equipamento"
  | "insumo"
  | "ferramenta"
  | "limpeza";

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  type: InventoryItemType;
}

interface Location {
  id: string;
  name: string;
  description?: string | null;
}

interface ProductFormProps {
  itemType: InventoryItemType;
  onSubmit: (data: ProductFormValues) => void | Promise<void>;
  onCreateCategory: (name: string) => Promise<Category>;
  onCancel?: () => void;
  defaultValues?: Partial<ProductFormValues>;
  categories: Category[];
  locations: Location[];
  isEditing?: boolean;
}

const typeLabels: Record<InventoryItemType, string> = {
  produto: "produto",
  equipamento: "equipamento",
  insumo: "insumo",
  ferramenta: "ferramenta",
  limpeza: "material de limpeza",
};

export default function ProductForm({
  itemType,
  onSubmit,
  onCreateCategory,
  onCancel,
  defaultValues,
  categories,
  locations,
  isEditing = false,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      categoryId: defaultValues?.categoryId || "",
      locationId: defaultValues?.locationId || "",
      quantity: defaultValues?.quantity ?? 0,
      minQuantity: defaultValues?.minQuantity ?? 0,
      unitPrice: defaultValues?.unitPrice ?? 0,
      description: defaultValues?.description || "",
    },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        unitPrice: Number(data.unitPrice),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      return;
    }

    try {
      setIsCreatingCategory(true);
      const newCategory = await onCreateCategory(trimmedName);
      form.setValue("categoryId", newCategory.id, { shouldValidate: true });
      setNewCategoryName("");
    } finally {
      setIsCreatingCategory(false);
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
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do item" {...field} />
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
                <FormLabel>Número do Patrimônio *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o patrimônio manualmente" {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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

          <div className="space-y-2">
            <FormLabel>Nova Categoria</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder={`Criar categoria para ${typeLabels[itemType]}`}
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleCreateCategory().catch((error) => {
                    alert((error as Error).message);
                  });
                }}
                disabled={isCreatingCategory || !newCategoryName.trim()}
              >
                {isCreatingCategory ? "Criando..." : "Criar"}
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
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
                  <Input type="number" min="0" placeholder="0" {...field} />
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
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
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
                  placeholder="Descreva o item"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
          O patrimônio agora é preenchido manualmente e as categorias podem ser criadas
          direto nesta tela para este tipo de cadastro.
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Atualizar Cadastro"
                : "Cadastrar Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
