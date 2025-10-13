import Produtos from "./Produtos";

export default function Ferramentas() {
  return (
    <Produtos 
      category="ferramenta"  // ← deve ser "ferramenta"
      title="Ferramentas" 
      description="Gerenciar ferramentas do estoque"
    />
  );
}