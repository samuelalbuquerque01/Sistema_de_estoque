import Produtos from "./Produtos";

export default function Limpeza() {
  return (
    <Produtos 
      category="limpeza"  // ← deve ser "limpeza"
      title="Produtos de Limpeza"
      description="Gerenciar produtos de limpeza do estoque"
    />
  );
}