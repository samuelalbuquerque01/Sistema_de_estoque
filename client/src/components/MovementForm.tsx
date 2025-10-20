// components/MovementForm.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const movementSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  type: z.enum(["entrada", "saida", "ajuste"], {
    required_error: "Tipo de movimentação é obrigatório",
  }),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  notes: z.string().optional(),
});

type MovementFormValues = z.infer<typeof movementSchema>;

interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
}

interface MovementFormProps {
  products: Product[];
  onSubmit: (data: MovementFormValues) => void;
  onCancel?: () => void;
}

export default function MovementForm({ products, onSubmit, onCancel }: MovementFormProps) {
  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: "entrada",
      quantity: 1,
      notes: "",
    },
  });

  const selectedProductId = form.watch("productId");
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.code} - {product.name} (Estoque: {product.quantity})
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Movimentação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entrada">Entrada no Estoque</SelectItem>
                  <SelectItem value="saida">Saída do Estoque</SelectItem>
                  <SelectItem value="ajuste">Ajuste de Estoque</SelectItem>
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
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              {selectedProduct && (
                <p className="text-sm text-muted-foreground">
                  Estoque atual: {selectedProduct.quantity}
                  {form.watch("type") === "saida" && (
                    <span className="ml-2">
                      → Novo estoque: {selectedProduct.quantity - (field.value || 0)}
                    </span>
                  )}
                  {form.watch("type") === "entrada" && (
                    <span className="ml-2">
                      → Novo estoque: {selectedProduct.quantity + (field.value || 0)}
                    </span>
                  )}
                  {form.watch("type") === "ajuste" && (
                    <span className="ml-2">
                      → Novo estoque: {field.value || 0}
                    </span>
                  )}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ex: Compra fornecedor, Saída para setor, Ajuste de inventário..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">
            Registrar Movimentação
          </Button>
        </div>
      </form>
    </Form>
  );
}