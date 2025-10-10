export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      {/* Cabeçalho */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">StockMaster</h1>
        <p className="text-sm text-gray-400 mt-1">Controle de Estoque</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">NAVEGAÇÃO</h2>
          <div className="space-y-1">
            <a href="/" className="flex items-center gap-3 p-2 rounded bg-gray-700 text-white">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Dashboard
            </a>
            <a href="/produtos" className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-gray-300">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Produtos
            </a>
            <a href="/locais" className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-gray-300">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Locais
            </a>
            <a href="/movimentacoes" className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-gray-300">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Movimentações
            </a>
            <a href="/inventario" className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-gray-300">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Inventário
            </a>
            <a href="/relatorios" className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-gray-300">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Relatórios
            </a>
          </div>
        </div>

        {/* Usuário */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              A
            </div>
            <div>
              <p className="text-sm font-medium">Administrador</p>
              <p className="text-xs text-gray-400">Usuário</p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}