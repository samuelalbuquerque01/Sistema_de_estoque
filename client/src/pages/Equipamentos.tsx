import Produtos from "./Produtos";

export default function Equipamentos() {
  return (
    <Produtos 
      category="equipamento"  // ← deve ser "equipamento"
      title="Equipamentos"
      description="Gerenciar equipamentos do estoque"
    />
  );
}