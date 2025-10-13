import Produtos from "./Produtos";

export default function Insumos() {
  return (
    <Produtos 
      category="insumo"  // ← deve ser "insumo" 
      title="Insumos"
      description="Gerenciar insumos do estoque"
    />
  );
}